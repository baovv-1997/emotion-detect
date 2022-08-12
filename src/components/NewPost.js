import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { v4 as uuidv4 } from "uuid";

const TINY_FACE_DETECTOR = "tiny_face_detector";
const SSD_MOBILENETV1 = "ssd_mobilenetv1";
const selectedFaceDetector = SSD_MOBILENETV1;

// ssd_mobilenetv1 options
const minConfidence = 0.5;

// tiny_face_detector options
const inputSize = 512;
const scoreThreshold = 0.5;

const NewPost = ({ images, reset, setLoading }) => {
  const imgRef = useRef();
  const [isLoaded, setLoaded] = useState(false);

  const detectEmotion = (detection) => {
    if (!detection) return;
    const expressions = detection.expressions;

    let value = 0;
    let type = "";
    if (value < expressions.surprised) {
      type = "surprised";
      value = expressions.surprised;
    }
    if (value < expressions.disgusted) {
      type = "disgusted";
      value = expressions.disgusted;
    }
    if (value < expressions.fearful) {
      type = "fearful";
      value = expressions.fearful;
    }
    if (value < expressions.sad) {
      type = "sad";
      value = expressions.sad;
    }
    if (value < expressions.angry) {
      type = "angry";
      value = expressions.angry;
    }
    if (value < expressions.happy) {
      type = "happy";
      value = expressions.happy;
    }
    if (value < expressions.neutral) {
      type = "neutral";
      value = expressions.neutral;
    }

    return type == 'happy';
  };

  const getFaceDetectorOptions = () => {
    return selectedFaceDetector === SSD_MOBILENETV1
      ? new faceapi.SsdMobilenetv1Options({ minConfidence })
      : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
  };

  const detectImage = async (input) => {
    const options = getFaceDetectorOptions();

    const detections = await faceapi
      .detectSingleFace(input, options)
      .withFaceExpressions();

    const link = document.createElement("a");

    link.href = input.src;

    const isHappy = detectEmotion(detections);
    console.log('isHappy', isHappy)
    if(isHappy) {
      link.setAttribute("download", input.name);
      link.setAttribute("target", "_blank");
      link.click();
    }
  };

  const handleImage = async () => {
    for (let item of images) {
      imgRef.current.src = item.url;
      imgRef.current.name = item.name;
      await detectImage(imgRef.current);
    }

    // // await Promise.all([listPromise]);
    setLoading(false);
    reset();
  };

  const getCurrentFaceDetectionNet = () => {
    if (selectedFaceDetector === SSD_MOBILENETV1) {
      return faceapi.nets.ssdMobilenetv1;
    }
    if (selectedFaceDetector === TINY_FACE_DETECTOR) {
      return faceapi.nets.tinyFaceDetector;
    }
  };

  const isFaceDetectionModelLoaded = () => {
    return !!getCurrentFaceDetectionNet().params;
  };

  useEffect(() => {
    const loadModels = async () => {
      if (!isFaceDetectionModelLoaded()) {
        await getCurrentFaceDetectionNet().load("/models");
      }

      const MODEL_URL = "/models";
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

      setLoaded(true);
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!images || !images.length || !isLoaded) return;

    handleImage();
  }, [images, isLoaded]);

  return (
    <div>
      <img ref={imgRef} crossOrigin="anonymous" alt="" />
    </div>
  );
};

export default NewPost;
