export function verdictFromScores(scores){
  if(!scores||scores.length!==1000||Array.from(scores).some(v=>!Number.isFinite(v)||v<0||v>1)||!Array.from(scores).some(v=>v>0))throw Error('The local model returned invalid scores.');
  const hotdog=scores[934];let other=0;for(let i=0;i<scores.length;i++)if(i!==934)other=Math.max(other,scores[i]);
  // Rankings are not calibrated probabilities. A positive requires a clear lead.
  // All remaining valid classifications use the entertainment toy's binary fallback.
  if(hotdog>=0.20&&hotdog>other*1.25)return {verdict:'HOTDOG',message:'A frank assessment. Checked on this device.'};
  return {verdict:'NOT HOTDOG',message:'No clear hotdog detected. Checked on this device.'};
}
