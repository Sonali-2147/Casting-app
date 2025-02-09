// import { useState } from 'react';
// import toast from 'react-hot-toast';

// export default function ImageUpload() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [label, setLabel] = useState('ok');

//   const handleFileChange = (event) => {
//     setSelectedFile(event.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       toast.error('Please select an image');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('image', selectedFile);
//     formData.append('label', label);

//     try {
//      const response= await axios.post('http://localhost:8004/api/method/sonali.api.upload_image', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         },
//         withCredentials: true
//       });
//       console.log(response);
//       toast.success('Image uploaded successfully');
//       setSelectedFile(null);
//     } catch (error) {
//       toast.error('Upload failed');
//     }
//   };

//   return (
//     <div>
//       <h2>Upload Metal Casting Images</h2>
//       <input type="file" accept="image/*" onChange={handleFileChange} />
//       <select value={label} onChange={(e) => setLabel(e.target.value)}>
//         <option value="ok">ok</option>
//         <option value="defective">defective</option>
//       </select>
//       <button onClick={handleUpload}>Upload</button>
//     </div>
//   );
// }

// import React, { useState, useRef } from 'react';
// import { Upload, Tag, Brain, Image as ImageIcon, Loader, CheckCircle, XCircle } from 'lucide-react';

// function App() {
//   const [images, setImages] = useState([]);
//   const [isTraining, setIsTraining] = useState(false);
//   const [model, setModel] = useState(null);
//   const fileInputRef = useRef(null);
//   const [predictionImage, setPredictionImage] = useState(null);
//   const [prediction, setPrediction] = useState(null);
//   const [isPredicting, setIsPredicting] = useState(false);
//   const predictionInputRef = useRef(null);

//   const handleImageUpload = (event) => {
//     const files = event.target.files;
//     if (!files) return;

//     Array.from(files).forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: Math.random().toString(36).substr(2, 9),
//           file,
//           label: null,
//           preview: e.target?.result
//         };
//         setImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };


//   const assignLabel = (id, label) => {
//     setImages(prev => prev.map(img => (img.id === id ? { ...img, label } : img)));
//   };

//   const removeImage = (id) => {
//     setImages(prev => prev.filter(img => img.id !== id));
//   };

//   const preprocessImage = async (imgSrc) => {
//     const imgElement = new Image();
//     imgElement.src = imgSrc;
//     await new Promise(resolve => {
//       imgElement.onload = resolve;
//     });

//     return tf.tidy(() => {
//       return tf.browser.fromPixels(imgElement)
//         .resizeNearestNeighbor([64, 64])
//         .toFloat()
//         .div(255.0)
//         .expandDims();
//     });
//   };

//   const trainModel = async () => {
//     const labeledImages = images.filter(img => img.label !== null);
//     if (labeledImages.length === 0) {
//       alert('Please label the images before training!');
//       return;
//     }

//     setIsTraining(true);
//     try {
//       const model = tf.sequential({
//         layers: [
//           tf.layers.conv2d({ inputShape: [64, 64, 3], kernelSize: 3, filters: 32, activation: 'relu' }),
//           tf.layers.maxPooling2d({ poolSize: 2 }),
//           tf.layers.flatten(),
//           tf.layers.dense({ units: 1, activation: 'sigmoid' })
//         ]
//       });

//       model.compile({
//         optimizer: tf.train.adam(0.0001),
//         loss: 'binaryCrossentropy',
//         metrics: ['accuracy']
//       });

//       const xs = [];
//       const ys = [];

//       for (const img of labeledImages) {
//         const tensor = await preprocessImage(img.preview);
//         xs.push(tensor);
//         ys.push(img.label === 'ok' ? 1 : 0);
//       }

//       const xDataset = tf.concat(xs);
//       const yDataset = tf.tensor(ys);

//       await model.fit(xDataset, yDataset, {
//         epochs: 20,
//         batchSize: 32,
//         validationSplit: 0.2
//       });

//       setModel(model);
//       alert('Training completed successfully!');
//     } catch (error) {
//       console.error('Training error:', error);
//       alert('Error during training.');
//     } finally {
//       setIsTraining(false);
//     }
//   };
//   const handlePredictionImageUpload = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setPredictionImage(e.target?.result);
//       setPrediction(null);
//     };
//     reader.readAsDataURL(file);
//   };

//   const predict = async () => {
//     if (!model || !predictionImage) return;

//     setIsPredicting(true);
//     try {
//       const tensor = await preprocessImage(predictionImage);
//       const prediction = await model.predict(tensor);
//       const probability = prediction.dataSync()[0];
//       setPrediction(probability > 0.5 ? 'ok' : 'defective');
//     } catch (error) {
//       console.error('Prediction error:', error);
//       alert('Error during prediction. Please check console for details.');
//     } finally {
//       setIsPredicting(false);
//     }
//   };


//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
//         <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
//           <Brain className="w-8 h-8 text-purple-600" />
//           Quality Control Classifier
//         </h1>

//         <button
//           onClick={() => fileInputRef.current?.click()}
//           className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 mb-4"
//         >
//           <Upload className="w-4 h-4" />
//           Upload Images
//         </button>
//         <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />

//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//           {images.map(img => (
//             <div key={img.id} className="relative">
//               <img src={img.preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
//               <div className="flex justify-center gap-2 mt-2">
//                 <button
//                   onClick={() => assignLabel(img.id, 'ok')}
//                   className={`px-3 py-1 rounded-md text-sm ${img.label === 'ok' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
//                 >
//                   OK
//                 </button>
//                 <button
//                   onClick={() => assignLabel(img.id, 'defective')}
//                   className={`px-3 py-1 rounded-md text-sm ${img.label === 'defective' ? 'bg-red-600 text-white' : 'bg-gray-300'}`}
//                 >
//                   Defective
//                 </button>
//               </div>
//               <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>

//         <button
//           onClick={trainModel}
//           disabled={isTraining || images.length === 0}
//           className={`flex items-center gap-2 px-4 py-2 rounded-md ${isTraining || images.length === 0 ? 'bg-gray-400' : 'bg-green-600 text-white'}`}
//         >
//           {isTraining ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
//           {isTraining ? 'Training...' : 'Train Model'}
//         </button>
//       </div>
//       <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
//         <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
//           <Brain className="w-8 h-8 text-purple-600" />
//           Quality Control Classifier
//         </h1>

//         <input ref={predictionInputRef} type="file" accept="image/*" onChange={handlePredictionImageUpload} className="hidden" />

//         <button
//           onClick={predict}
//           disabled={!model || !predictionImage || isPredicting}
//           className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
//         >
//           {isPredicting ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
//           {isPredicting ? 'Predicting...' : 'Predict'}
//         </button>

//         {prediction && (
//           <p className="mt-4 text-xl font-bold">Prediction: <span className={prediction === 'ok' ? 'text-green-600' : 'text-red-600'}>{prediction}</span></p>
//         )}
//       </div>
//     </div>
//     </div>
    
//   );
// }

// export default App;


//final ui-----------------------------------------



// import React, { useState, useRef } from 'react';
// import { Upload, Brain, Loader, LogOut } from 'lucide-react';
// import toast from 'react-hot-toast';
// import * as tf from '@tensorflow/tfjs';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// function App({ setIsAuthenticated }) {
//   const [images, setImages] = useState([]);
//   const [isTraining, setIsTraining] = useState(false);
//   const [model, setModel] = useState(null);
//   const fileInputRef = useRef(null);
//   const [predictionImage, setPredictionImage] = useState(null);
//   const [prediction, setPrediction] = useState(null);
//   const [isPredicting, setIsPredicting] = useState(false);
//   const predictionInputRef = useRef(null);
//   const navigate = useNavigate();

//   const handleImageUpload = (event) => {
//     const files = event.target.files;
//     if (!files) return;

//     Array.from(files).forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const newImage = {
//           id: Math.random().toString(36).substr(2, 9),
//           file,
//           label: null,
//           preview: e.target?.result
//         };
//         setImages(prev => [...prev, newImage]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };


//   const assignLabel = (id, label) => {
//     setImages(prev => prev.map(img => (img.id === id ? { ...img, label } : img)));
//   };

//   const removeImage = (id) => {
//     setImages(prev => prev.filter(img => img.id !== id));
//   };

//   const preprocessImage = async (imgSrc) => {
//     const imgElement = new Image();
//     imgElement.src = imgSrc;
//     await new Promise(resolve => {
//       imgElement.onload = resolve;
//     });

//     return tf.tidy(() => {
//       return tf.browser.fromPixels(imgElement)
//         .resizeNearestNeighbor([64, 64])
//         .toFloat()
//         .div(255.0)
//         .expandDims();
//     });
//   };


//   const trainModel = async () => {
//     const labeledImages = images.filter(img => img.label !== null);
//     if (labeledImages.length === 0) {
//       alert('Please label the images before training!');
//       return;
//     }

//     setIsTraining(true);
//     try {
//       const model = tf.sequential({
//         layers: [
//           tf.layers.conv2d({ inputShape: [64, 64, 3], kernelSize: 3, filters: 32, activation: 'relu' }),
//           tf.layers.maxPooling2d({ poolSize: 2 }),
//           tf.layers.flatten(),
//           tf.layers.dense({ units: 1, activation: 'sigmoid' })
//         ]
//       });

//       model.compile({
//         optimizer: tf.train.adam(0.0001),
//         loss: 'binaryCrossentropy',
//         metrics: ['accuracy']
//       });

//       const xs = [];
//       const ys = [];

//       for (const img of labeledImages) {
//         const tensor = await preprocessImage(img.preview);
//         xs.push(tensor);
//         ys.push(img.label === 'ok' ? 1 : 0);
//       }

//       const xDataset = tf.concat(xs);
//       const yDataset = tf.tensor(ys);

//       await model.fit(xDataset, yDataset, {
//         epochs: 20,
//         batchSize: 32,
//         validationSplit: 0.2
//       });

//       setModel(model);
//       alert('Training completed successfully!');
//     } catch (error) {
//       console.error('Training error:', error);
//       alert('Error during training.');
//     } finally {
//       setIsTraining(false);
//     }
//   };

//   const handlePredictionImageUpload = (event) => {
//     const file = event.target.files[0]; // Get the first file
  
//     if (!file) {
//       console.error("No file selected or invalid file");
//       return;
//     }
  
//     const imageUrl = URL.createObjectURL(file);
//     setPredictionImage(imageUrl); // Ensure this is a valid state update
//   };
  


//   const predict = async () => {
//     if (!model || !predictionImage) return;

//     setIsPredicting(true);
//     try {
//       const tensor = await preprocessImage(predictionImage);
//       const prediction = await model.predict(tensor);
//       const probability = prediction.dataSync()[0];
//       setPrediction(probability > 0.5 ? 'ok' : 'defective');
//     } catch (error) {
//       console.error('Prediction error:', error);
//       alert('Error during prediction. Please check console for details.');
//     } finally {
//       setIsPredicting(false);
//     }
//   };


//   const triggerFileUpload = () => {
//     if (predictionInputRef.current) {
//       predictionInputRef.current.click();
//     }
//   };
  

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         backgroundColor: "#f3f4f6",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         padding: "24px",
//       }}
//     >
//       {/* Logout Button */}
//       <button
//         onClick={() => navigate("/")}
//         style={{
//           position: "absolute",
//           top: "16px",
//           right: "16px",
//           backgroundColor: "#ef4444",
//           color: "white",
//           padding: "8px 16px",
//           borderRadius: "8px",
//           display: "flex",
//           alignItems: "center",
//           gap: "8px",
//           boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//           cursor: "pointer",
//           transition: "background-color 0.3s",
//         }}
//         onMouseOver={(e) => (e.target.style.backgroundColor = "#dc2626")}
//         onMouseOut={(e) => (e.target.style.backgroundColor = "#ef4444")}
//       >
//         <LogOut size={16} /> Logout
//       </button>

//       <div
//         style={{
//           maxWidth: "640px",
//           width: "100%",
//           backgroundColor: "white",
//           borderRadius: "8px",
//           boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//           padding: "24px",
//           marginTop: "48px",
//         }}
//       >
//         <h1
//           style={{
//             fontSize: "24px",
//             fontWeight: "bold",
//             color: "#9333ea",
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//           }}
//         >
//           <Brain size={32} /> Quality Control Classifier
//         </h1>

//         {/* Image Upload */}
//         <button
//           onClick={() => fileInputRef.current?.click()}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             backgroundColor: "#9333ea",
//             color: "white",
//             padding: "8px 16px",
//             borderRadius: "8px",
//             marginBottom: "16px",
//             cursor: "pointer",
//             transition: "background-color 0.3s",
//           }}
//         >
//           <Upload size={16} /> Upload Images
//         </button>
//         <input
//           ref={fileInputRef}
//           type="file"
//           multiple
//           accept="image/*"
//           onChange={handleImageUpload}
//           style={{ display: "none" }}
//         />

//         {/* Image Gallery */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
//             gap: "16px",
//             marginBottom: "24px",
//           }}
//         >
//           {images.map((img) => (
//             <div
//               key={img.id}
//               style={{
//                 position: "relative",
//                 backgroundColor: "#e5e7eb",
//                 padding: "8px",
//                 borderRadius: "8px",
//                 boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
//               }}
//             >
//               <img
//                 src={img.preview}
//                 alt="Preview"
//                 style={{
//                   width: "100%",
//                   height: "80px",
//                   objectFit: "cover",
//                   borderRadius: "8px",
//                 }}
//               />
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   gap: "8px",
//                   marginTop: "8px",
//                 }}
//               >
//                 <button
//                   onClick={() => assignLabel(img.id, "ok")}
//                   style={{
//                     padding: "4px 8px",
//                     borderRadius: "4px",
//                     fontSize: "14px",
//                     backgroundColor:
//                       img.label === "ok" ? "#16a34a" : "#d1d5db",
//                     color: img.label === "ok" ? "white" : "black",
//                   }}
//                 >
//                   OK
//                 </button>
//                 <button
//                   onClick={() => assignLabel(img.id, "defective")}
//                   style={{
//                     padding: "4px 8px",
//                     borderRadius: "4px",
//                     fontSize: "14px",
//                     backgroundColor:
//                       img.label === "defective" ? "#dc2626" : "#d1d5db",
//                     color: img.label === "defective" ? "white" : "black",
//                   }}
//                 >
//                   Defective
//                 </button>
//               </div>
//               <button
//                 onClick={() => removeImage(img.id)}
//                 style={{
//                   position: "absolute",
//                   top: "8px",
//                   right: "8px",
//                   backgroundColor: "#ef4444",
//                   color: "white",
//                   padding: "4px 8px",
//                   borderRadius: "4px",
//                   fontSize: "12px",
//                   cursor: "pointer",
//                 }}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>


//       <button
//   onClick={trainModel}
//   disabled={isTraining || images.length === 0}
//   style={{
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     padding: "8px 16px",
//     borderRadius: "8px",
//     backgroundColor: isTraining || images.length === 0 ? "#9ca3af" : "#16a34a",
//     color: isTraining || images.length === 0 ? "#000" : "#fff",
//     cursor: isTraining || images.length === 0 ? "not-allowed" : "pointer",
//     transition: "background-color 0.3s",
//   }}
// >
//   {isTraining ? <Loader style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <Brain style={{ width: "16px", height: "16px" }} />}
//   {isTraining ? "Training..." : "Train Model"}
// </button>




// {/* Prediction Section */}
// <div
//   style={{
//     maxWidth: "640px",
//     margin: "32px auto",
//     backgroundColor: "white",
//     borderRadius: "8px",
//     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//     padding: "24px",
//   }}
// >
//   <h1
//     style={{
//       fontSize: "24px",
//       fontWeight: "bold",
//       display: "flex",
//       alignItems: "center",
//       gap: "8px",
//       color: "#2563eb",
//     }}
//   >
//     <Brain size={32} /> Predict Image Quality
//   </h1>


//   {/* Image Upload Button */}
//   <button
//         onClick={triggerFileUpload}
//         style={{
//           padding: "8px 16px",
//           borderRadius: "6px",
//           backgroundColor: "#10b981",
//           color: "white",
//           cursor: "pointer",
//           border: "none",
//           marginBottom: "16px",
//         }}
//       >
//         Upload Image
//       </button>

//       {/* Hidden File Input */}
//       <input
//         ref={predictionInputRef}
//         type="file"
//         accept="image/*"
//         onChange={handlePredictionImageUpload}
//         style={{ display: "none" }}
//       />

//       {/* Image Preview */}
//       {predictionImage && (
//         <div style={{ marginTop: "10px" }}>
//           <img
//             src={predictionImage}
//             alt="Uploaded Preview"
//             style={{ maxWidth: "300px", borderRadius: "8px" }}
//           />
//         </div>
//       )}

// <button
//   onClick={predict}
//   disabled={!model || !predictionImage || isPredicting}
//   style={{
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     padding: '8px 16px',
//     borderRadius: '6px',
//     backgroundColor: isPredicting ? '#4c4c4c' : '#2563eb',
//     color: 'white',
//     cursor: isPredicting ? 'not-allowed' : 'pointer',
//     transition: 'background-color 0.2s ease-in-out',
//     border: 'none'
//   }}
//   onMouseEnter={(e) => !isPredicting && (e.target.style.backgroundColor = '#1d4ed8')}
//   onMouseLeave={(e) => !isPredicting && (e.target.style.backgroundColor = '#2563eb')}
// >
//   {isPredicting ? (
//     <Loader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
//   ) : (
//     <Brain style={{ width: '16px', height: '16px' }} />
//   )}
//   {isPredicting ? 'Predicting...' : 'Predict'}
// </button>

// {prediction && (
//   <p
//     style={{
//       marginTop: '16px',
//       fontSize: '20px',
//       fontWeight: 'bold',
//       color: prediction === 'ok' ? '#16a34a' : '#dc2626'
//     }}
//   >
//     Prediction: <span>{prediction}</span>
//   </p>
// )}

//     </div>
//     </div>
//   );
// }

// export default App;

// steps-final ui

import { useState, useRef, useEffect } from "react";
import { Box, Typography, Stepper, Step, StepLabel, Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as tf from "@tensorflow/tfjs";
import { useNavigate } from "react-router-dom";


function App() {
  const [images, setImages] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [model, setModel] = useState(null);
  const [predictionImage, setPredictionImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [newBox, setNewBox] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);

  
  const predictionInputRef = useRef(null);
  const navigate = useNavigate();
  const steps = ["Upload & Label Data", "Train Model", "Predict"];

  const handleNextStep = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = Array.from(files).map(file => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        label: null,
        preview: URL.createObjectURL(file),
      };
    });

    setImages(prev => [...prev, ...newImages]);
  };
  
  const assignLabel = (id, label) => {
    setImages(prev => prev.map(img => (img.id === id ? { ...img, label } : img)));
  };

  const preprocessImage = async (imgSrc) => {
    const imgElement = new Image();
    imgElement.src = imgSrc;
    await new Promise(resolve => { imgElement.onload = resolve; });
    return tf.tidy(() => {
      return tf.browser.fromPixels(imgElement)
        .resizeNearestNeighbor([64, 64])
        .toFloat()
        .div(255.0)
        .expandDims();
    });
  };


  const trainModel = async () => {
    const labeledImages = images.filter(img => img.label !== null);
    if (labeledImages.length === 0) {
      alert('Please label the images before training!');
      return;
    }

    setIsTraining(true);
    try {
      const model = tf.sequential({
        layers: [
          tf.layers.conv2d({ inputShape: [64, 64, 3], kernelSize: 3, filters: 32, activation: 'relu' }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.flatten(),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      model.compile({
        optimizer: tf.train.adam(0.0001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      const xs = [];
      const ys = [];

      for (const img of labeledImages) {
        const tensor = await preprocessImage(img.preview);
        xs.push(tensor);
        ys.push(img.label === 'ok' ? 1 : 0);
      }

      const xDataset = tf.concat(xs);
      const yDataset = tf.tensor(ys);

      await model.fit(xDataset, yDataset, {
        epochs: 20,
        batchSize: 32,
        validationSplit: 0.2
      });

      setModel(model);
      alert('Training completed successfully!');
    } catch (error) {
      console.error('Training error:', error);
      alert('Error during training.');
    } finally {
      setIsTraining(false);
    }
  };

    const handlePredictionImageUpload = (event) => {
    const file = event.target.files[0]; // Get the first file
  
    if (!file) {
      console.error("No file selected or invalid file");
      return;
    }
  
    const imageUrl = URL.createObjectURL(file);
    setPredictionImage(imageUrl); // Ensure this is a valid state update
  };
  


  const predict = async () => {
    if (!model || !predictionImage) return;

    setIsPredicting(true);
    try {
      const tensor = await preprocessImage(predictionImage);
      const prediction = await model.predict(tensor);
      const probability = prediction.dataSync()[0];
      setPrediction(probability > 0.5 ? 'Ok ✅ ' : 'Defective ❌ ');
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Error during prediction. Please check console for details.');
    } finally {
      setIsPredicting(false);
    }
  };


  const triggerFileUpload = () => {
    if (predictionInputRef.current) {
      predictionInputRef.current.click();
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("authToken"); 
    navigate("/"); 
  };
  


  return (
    <div>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "20px",
        backgroundImage: "url('https://www.shutterstock.com/shutterstock/videos/1107538677/thumb/1.jpg?ip=x480')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
  <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
    <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
    🛠️  Metal Casting Classification  🛠️
    </Typography>
  </Box>
  <Button variant="contained" color="error" onClick={handleLogout}>
    Logout
  </Button>
</Box>

      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", padding: "20px" }}>
        <Box sx={{ flex: 1, padding: "20px", background: "radial-gradient(circle, rgba(255,241,247,0.6656863428965336) 0%, rgba(219,226,235,1) 100%)", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",objectfit: "cover"}}>
          <Stepper activeStep={activeStep} sx={{ marginBottom: "20px" }}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
  
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6">Step 1: Upload & Label Images</Typography>
              <input type="file" multiple onChange={handleImageUpload} style={{ marginTop: "10px" }} />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                {images.map((img) => (
                  <Box key={img.id} sx={{ position: "relative" }}>
                    <img src={img.preview} alt="Preview" width={100} height={100} style={{ borderRadius: "8px" }} />
                    <Box sx={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
                      <Button size="small" variant={img.label === "ok" ? "contained" : "outlined"} color="success" onClick={() => assignLabel(img.id, "ok")}>
                        OK
                      </Button>
                      <Button size="small" variant={img.label === "defective" ? "contained" : "outlined"} color="error" onClick={() => assignLabel(img.id, "defective")}>
                        Defective
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Button variant="contained" sx={{ marginTop: "10px" }} onClick={handleNextStep}>
                Next
              </Button>
            </Box>
          )}

  
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6">Step 2: Train Model</Typography>
              <Button variant="contained" sx={{ marginTop: "10px" }} onClick={trainModel} disabled={isTraining}>
                {isTraining ? "Training..." : "Train Model"}
              </Button>
              <Button variant="contained" sx={{ marginTop: "10px", marginLeft: "10px" }} onClick={handleNextStep}>
                Next
              </Button>
            </Box>
          )}
  
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" textAlign="center">Step 3: Predict</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "10px", gap: "20px" }}>
                <input type="file" ref={predictionInputRef} accept="image/*" onChange={handlePredictionImageUpload} style={{ display: "none" }} />
                <Box sx={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "10px" }}>
                  <Button variant="contained" onClick={triggerFileUpload}>Upload Image for Prediction</Button>
                </Box>
                {predictionImage && (
                  <Box sx={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                    <img src={predictionImage} alt="Uploaded Preview" width={200} />
                  </Box>
                )}
                <Box sx={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "10px" }}>
                  <Button variant="contained" color="primary" onClick={predict} disabled={isPredicting}>
                    {isPredicting ? "Predicting..." : "Predict"}
                  </Button>
                </Box>
                {prediction && (
                  <Typography 
                    variant="h6" 
                    sx={{ marginTop: "10px", textAlign: "center", color: prediction === 'Ok' ? 'green' : 'red', fontWeight: 'bold' }}>
                    Prediction: {prediction}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
  
          <ToastContainer />
        </Box>
      </Box>
    </Box>
    </div>


  );
  
}


  
export default App;


