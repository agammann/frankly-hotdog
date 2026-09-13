export function verdictFromScores(scores){
  if(scores.length!==1000||Array.from(scores).some(v=>!Number.isFinite(v)||v<0||v>1))throw Error('The local model returned invalid scores.');
  const hotdog=scores[934];let other=0;for(let i=0;i<scores.length;i++)if(i!==934)other=Math.max(other,scores[i]);
  // These scores are model rankings, not calibrated probabilities of correctness.
  if(hotdog>=0.20&&hotdog>other*1.25)return {verdict:'HOTDOG',message:'A frank assessment. Checked on this device.'};
  if(other>=0.20&&hotdog<0.08&&other>hotdog*3)return {verdict:'NOT HOTDOG',message:'The rest of the universe. Checked on this device.'};
  return {verdict:'UNCERTAIN',message:'This little model is not sure. Try a clear photo of one object.'};
}
