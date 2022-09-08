import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceDetection from "@tensorflow-models/face-detection";

const estimationConfig = { flipHorizontal: false };

const NewPost = ({ images, reset, setLoading, setList }) => {
  const imgRef = useRef();
  const [detector, setDetector] = useState();
  const [model, setModel] = useState();

  const [modelsLoaded, setModelsLoaded] = useState(false);

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

    return type;
  };

  const detectImage = async (input) => {
    let emotion = null;

    const detection = await detector.estimateFaces(input, estimationConfig);

    if (detection.length > 0) {
      const box = detection[0].box;

      const face_canvas = document.createElement("canvas");
      const face_canvas_ctx = face_canvas.getContext("2d");
      face_canvas_ctx.width = box.width;
      face_canvas_ctx.height = box.height;

      face_canvas_ctx.drawImage(
        input,
        box.xMin,
        box.yMin,
        box.width,
        box.height,
        0,
        0,
        box.width,
        box.height
      );

      const tensor = tf.tidy(() => {
        const img = tf.browser.fromPixels(face_canvas);

        const normalizationOffset = tf.scalar(255 / 2);
        const tensor = img
          .resizeNearestNeighbor([112, 112])
          .toFloat()
          .sub(normalizationOffset)
          .div(normalizationOffset)
          .reverse(2)
          .expandDims();
        return tensor;
      });

      const predictions = await model.predict(tensor);

      const predict = predictions.dataSync();

      tensor.dispose();
      predictions.dispose();

      const expressions = {
        angry: predict[0],
        disgusted: predict[1],
        fearful: predict[2],
        happy: predict[3],
        neutral: predict[4],
        sad: predict[5],
        surprised: predict[6],
      };

      const result = { expressions: expressions };

      emotion = detectEmotion(result);
    } else {
      emotion = "null";
    }

    console.log("emotion", input.name, emotion);
    setList((prev) => [
      ...prev,
      {
        image: input.name,
        emotion,
      },
    ]);
  };

  const handleImage = async () => {
    for (let item of images) {
      let image = new Image();
      image.src = item.url;
      image.name = item.name;

      image.addEventListener("load", async (event) => {
        await detectImage(image);
      });
    }

    // // await Promise.all([listPromise]);
    setLoading(false);
    reset();
  };

  useEffect(() => {
    const loadModels = async () => {
      const face_detect = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig = {
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
      };

      const detector = await faceDetection.createDetector(
        face_detect,
        detectorConfig
      );

      const model = await tf.loadLayersModel("/models/model.json");
      // model.summary();

      setDetector(detector);
      setModel(model);

      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!images || !images.length || !modelsLoaded || !detector || !model)
      return;

    handleImage();
  }, [images, detector, model, modelsLoaded]);

  return (
    <div>
      <img ref={imgRef} crossOrigin="anonymous" alt="" />;
    </div>
  );
};

export default NewPost;
