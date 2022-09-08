import { useEffect, useRef, useState } from "react";
import NewPost from "./components/NewPost";
import "./App.css";
import { CSVLink } from "react-csv";

function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  const imgRef = useRef();

  // useEffect(() => {

  // }, [files]);

  const reset = () => {
    setImages([]);
    imgRef.current.value = "";
  };

  const onChange = (files) => {
    console.log("files", files);
    const getImage = () => {
      let newImages = [];
      for (let item of files) {
        let newImage = {};
        const img = new Image();
        img.src = URL.createObjectURL(item);
        img.onload = () => {
          newImage.name = item.name;
          newImage.url = img.src;
          newImage.width = img.width;
          newImage.height = img.height;
        };
        newImages.push(newImage);
      }
      setImages(newImages);
    };

    files && files.length && getImage();
  };

  return (
    <div>
      <div className="newPostCard">
        <div className="addPost">
          <div className="postForm">
            {loading && <span>loading...</span>}
            <label htmlFor="file" className="addImg">
              Send
            </label>
            <input
              ref={imgRef}
              multiple
              onChange={(e) => {
                setLoading(true);
                onChange(e.target.files);
              }}
              id="file"
              style={{ display: "none" }}
              type="file"
            />
          </div>
        </div>
      </div>
      <CSVLink
        data={list}
        headers={[
          { label: "image", key: "image" },
          { label: "emotion", key: "emotion" },
        ]}
      >
        Download me
      </CSVLink>
      {images && images.length && (
        <NewPost
          images={images}
          reset={reset}
          setLoading={setLoading}
          setList={setList}
        />
      )}
    </div>
  );
}

export default App;
