import {useCurrentFrame,interpolate,spring} from 'remotion';
import {Robot,Bulb,Paper,palette} from './Art';
export const CouncilImpact=()=>{
 const f=useCurrentFrame();const p=spring({frame:f,fps:30,config:{damping:9,stiffness:230,mass:.65}});const zoom=interpolate(f,[0,4,10],[2.1,.94,1],{extrapolateRight:'clamp'});const exit=interpolate(f,[34,42],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <svg width="720" height="500" style={{position:'absolute',top:0,opacity:exit,overflow:'hidden'}}>
 <g transform={`translate(360 230) scale(${zoom})`} opacity={Math.min(1,p)}>
 {Array.from({length:12},(_,i)=><path key={i} d={`M0 ${140+f*2}v${45-f}`} transform={`rotate(${i*30})`} stroke={i%2?'#a773ec':'#f6b945'} strokeWidth="8" strokeLinecap="round" opacity={Math.max(0,1-f/25)}/>)}
 <text textAnchor="middle" y="-45" fontFamily="Arial" fontWeight="1000" fontSize="78" fill="#f6bd47" stroke="#172238" strokeWidth="8" paintOrder="stroke">THE</text>
 <text textAnchor="middle" y="70" fontFamily="Arial" fontWeight="1000" fontSize="110" letterSpacing="-5" fill="#ac78ed" stroke="#172238" strokeWidth="10" paintOrder="stroke">COUNCIL</text>
 <path d={`M${-240*p} 97H${240*p}`} stroke="#f6bd47" strokeWidth="9" strokeLinecap="round"/>
 </g></svg>;
};
export const IdeaDecision=()=>{const f=useCurrentFrame();return <svg width="720" height="500"><rect width="720" height="500" fill="white"/><g transform={`translate(360 ${155+Math.sin(f/7)*8}) rotate(${Math.sin(f/10)*8})`}><Bulb x={0} y={0} s={1.1}/></g><Robot x={250+Math.sin(f/10)*20} y={340} s={.65} pose="think" phase={f/24} color={palette[0]}/><Robot x={480-Math.sin(f/10)*20} y={340} s={.65} pose="argue" phase={f/24} color={palette[1]}/><text x="125" y={220+Math.sin(f/8)*12} fill="#51ae9d" fontSize="78" fontWeight="900">✓</text><text x="525" y={220-Math.sin(f/8)*12} fill="#a773ec" fontSize="80" fontWeight="900">?</text></svg>};

export const RecommendationMini=()=>{const f=useCurrentFrame();const p=Math.min(1,f/12);return <svg width="720" height="500"><rect width="720" height="500" fill="white"/>{[0,1,2].map(i=><g key={i}><Robot x={170+i*190} y={350-Math.abs(Math.sin(f/7+i))*10} s={.58} pose="win" phase={f/24+i} color={palette[i]}/><g transform={`translate(${(170+i*190)*(1-p)+360*p} ${230-p*70+Math.sin(f/9)*6}) scale(.85)`}><Paper x={0} y={0} color={palette[i]} mark={p===1?'check':'lines'}/></g></g>)}</svg>};
