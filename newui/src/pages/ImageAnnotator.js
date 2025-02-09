import React, { useState } from "react";
import Annotation from "react-image-annotation";
import axios from "axios";

const ImageAnnotator = ({ image }) => {
  const [annotations, setAnnotations] = useState([]);
  const [annotation, setAnnotation] = useState({});
  const [label, setLabel] = useState("");

  const handleSubmit = () => {
    if (annotation && annotation.geometry) {
      const newAnnotation = {
        ...annotation,
        data: { label },
      };
      setAnnotations([...annotations, newAnnotation]);
      setAnnotation({});
      setLabel("");
    }
  };

  const saveAnnotations = async () => {
    await axios.post("http://localhost:8004/api/method/sonali.api.save_label", {
      image_url: image,
      label_data: JSON.stringify(annotations),
    });
    alert("Labels saved!");
  };
  return (
    <div>
      {image && (
        <>
          <Annotation
            src={image}
            annotations={annotations}
            value={annotation}
            onChange={setAnnotation}
            onSubmit={handleSubmit}
          />
          <input
            type="text"
            placeholder="Enter Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button onClick={handleSubmit}>Add Label</button>
          <button onClick={saveAnnotations}>Save Labels</button>
        </>
      )}
    </div>
  );
};

export default ImageAnnotator;