import * as tf from '@tensorflow/tfjs-core';
import {loadLayersModel} from '@tensorflow/tfjs-layers';
import '@tensorflow/tfjs-backend-cpu';
import {verdictFromScores} from './verdict.mjs';
import {imageDataBlob} from './image-data.mjs';
let loading;
export function loadDeviceModel(){
  if(!loading)loading=(async()=>{await tf.setBackend('cpu');await tf.ready();return loadLayersModel(new URL('./model/v1-100/model.json',import.meta.url).href);})().catch(e=>{loading=null;throw e;});
  return loading;
}
export async function scoreImageOnDevice(image){
  if(typeof image!=='string'||image.length>2_000_000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image))throw Error('Choose a supported image to check on this device.');
  const blob=imageDataBlob(image);
  const bitmap=await createImageBitmap(blob);
  if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>16_000_000){bitmap.close();throw Error('This image is too large.');}
  const canvas=new OffscreenCanvas(224,224),ctx=canvas.getContext('2d');
  try{if(!ctx)throw Error('Image processing is unavailable.');ctx.drawImage(bitmap,0,0,224,224);}finally{bitmap.close();}
  const pixels=ctx.getImageData(0,0,224,224).data,rgb=new Float32Array(224*224*3);
  for(let i=0,j=0;i<pixels.length;i+=4){rgb[j++]=pixels[i]/127.5-1;rgb[j++]=pixels[i+1]/127.5-1;rgb[j++]=pixels[i+2]/127.5-1;}
  const model=await loadDeviceModel(),tensor=tf.tensor4d(rgb,[1,224,224,3]);
  let output;try{output=model.predict(tensor);return await output.data();}finally{tensor.dispose();output?.dispose();}
}
export async function classifyOnDevice(image){return verdictFromScores(await scoreImageOnDevice(image));}
