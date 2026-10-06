import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Robot,Bulb,Paper,Burst,palette} from './Art';
const white='#172238';
const Title:React.FC<{children:React.ReactNode;y?:number;size?:number}>=({children,y=120,size=47})=><text x="360" y={y} textAnchor="middle" fill={white} fontFamily="Arial" fontWeight="900" fontSize={Math.min(size,640/(String(children).length*.62))} letterSpacing="-1" stroke="#172238" strokeWidth="0" paintOrder="stroke" strokeLinejoin="round">{children}</text>;
export const Backdrop=()=> <rect width="720" height="1280" fill="white"/>;
const ease=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p)};
const arc=(f:number,start:number,duration:number,from:[number,number],to:[number,number],height=100)=>{const p=ease((f-start)/duration);return {x:from[0]+(to[0]-from[0])*p,y:from[1]+(to[1]-from[1])*p-Math.sin(p*Math.PI)*height,p}};
export const Arena:React.FC<{mode?:'hook'|'debate';compact?:boolean}>=({compact=false})=>{
 const f=useCurrentFrame(); const t=f/30;
 // Three distinct actions: run in, exchange arguments, then recoil and regroup.
 const enter=ease(f/25), exchange=ease((f-42)/35), regroup=ease((f-95)/34);
 const ax=-90+enter*305+exchange*48-regroup*65;
 const bx=810-enter*300-exchange*50+regroup*30;
 const p1=arc(f,37,40,[ax+50,230],[bx-40,265],125);
 const p2=arc(f,80,40,[bx-35,235],[ax+50,275],125);
 return <svg width="720" height={compact?500:1280} viewBox="0 0 720 500"><Backdrop/>
 <ellipse cx="360" cy="426" rx="270" ry="24" fill="#e9eef3"/>
 <path d="M100 416h520" stroke="#d4dee7" strokeWidth="3"/>
 <g transform={`translate(360 115) rotate(${Math.sin(t*2)*7})`}><Bulb x={0} y={0} s={.64}/></g>
 <Robot x={ax} y={300-Math.sin(exchange*Math.PI)*24} s={.87} color={palette[0]} pose={f<30||f>100?'walk':'argue'} phase={t}/>
 <Robot x={bx} y={300-Math.sin(exchange*Math.PI)*18} s={.87} color={palette[1]} pose={f<30||f>100?'walk':'argue'} phase={t+.4} flip/>
 {f>32&&f<90&&<g transform={`translate(${p1.x} ${p1.y}) rotate(${p1.p*340-15}) scale(.48)`}><Paper x={0} y={0} color={palette[0]}/></g>}
 {f>76&&f<135&&<g transform={`translate(${p2.x} ${p2.y}) rotate(${-p2.p*330+10}) scale(.48)`}><Paper x={0} y={0} color={palette[1]}/></g>}
 {f>128&&<Robot x={360} y={300+(1-ease((f-128)/22))*210} s={.64} color={palette[2]} pose="think" phase={t}/>}
 </svg>;
};
export const Council:React.FC<{compact?:boolean;frame?:number}>=({compact=false,frame})=>{
 const local=useCurrentFrame();const f=frame??local,t=f/30;
 return <svg width="720" height={compact?500:1280} viewBox={`0 0 720 ${compact?500:1280}`}><Backdrop/>
 {!compact&&<><Title y={155} size={66}>THE COUNCIL</Title><Title y={210} size={23}>A SKILL FOR CODEX</Title></>}
 <g transform={compact?'translate(0,0)':'translate(0,260) scale(1,1.15)'}>
 <Bulb x={360} y={88} s={.6}/>
 {[0,1,2].map(i=>{const entry=ease((f-i*7)/25);const cycle=Math.max(0,f-45);const angle=cycle/36+i*Math.PI*2/3;const spread=ease(cycle/28);const x=(i===0?-120:i===1?360:840)*(1-entry)+(160+i*200)*entry;const orbitX=360+Math.sin(angle)*217;const orbitY=280+Math.cos(angle)*53;const px=x*(1-spread)+orbitX*spread;const py=290*(1-spread)+orbitY*spread;const paper=arc(cycle%90,i*10,44,[px,py-80],[360,145],60);return <g key={i}>
 <path d={`M360 130Q${px} 145 ${px} ${py-55}`} stroke={palette[i]} strokeWidth="3" strokeDasharray="5 9" strokeDashoffset={-f*2} fill="none" opacity=".65"/>
 <Robot x={px} y={py} s={.72} color={palette[i]} pose={f<45?'walk':cycle%90<45?'argue':'think'} phase={t+i} flip={px>360}/>
 {cycle>0&&<g transform={`translate(${paper.x} ${paper.y}) rotate(${paper.p*30-15}) scale(.32)`}><Paper x={0} y={0} color={palette[i]}/></g>}
 </g>})}
 </g></svg>;
};
export const Independent=()=>{const f=useCurrentFrame();const t=f/30;return <svg width="720" height="1280"><Backdrop/><Title y={155} size={54}>THINK INDEPENDENTLY</Title><Title y={215} size={23}>BEFORE SEEING THE OTHER ANSWERS</Title>
 {[0,1,2].map(i=><g key={i}><path d={`M${105+i*245} 770h90`} stroke="#435673" strokeWidth="9"/><Robot x={120+i*240+(1-ease((f-i*8)/25))*(i===2?240:-240)} y={680-Math.sin(ease((f-50-i*8)/22)*Math.PI)*24} s={.9} color={palette[i]} pose={f<32?"walk":f<65?"think":"argue"} phase={t+i}/><g opacity={Math.min(1,Math.max(0,(t-.3-i*.28)*3))}><Paper x={120+i*240} y={490+Math.sin(t*2+i)*10+(1-ease((f-22-i*8)/20))*120} angle={i===1?0:i===0?-6:6} color={palette[i]}/><circle cx={120+i*240} cy="574" r="5" fill="white"/><circle cx={120+i*240} cy="594" r="3" fill="white"/></g></g>)}
 <path d="M240 345v480M480 345v480" stroke="#8493ac" strokeWidth="4" strokeDasharray="10 13"/><Title y={965} size={31}>THREE PERSPECTIVES. NO PEEKING.</Title></svg>};
export const Debate=()=>{const f=useCurrentFrame();const t=f/30;const phase=t<2?'READ':t<4?'CHALLENGE':'RECONSIDER';return <svg width="720" height="1280"><Backdrop/><Title y={150} size={53}>{phase} THE IDEAS</Title><ellipse cx="360" cy="805" rx="315" ry="65" fill="#edf1f5"/><Robot x={220+Math.sin(t*1.45)*62} y={670+Math.cos(t*1.45)*18} color={palette[0]} pose="argue" phase={t}/><Robot x={515-Math.sin(t*1.45)*55} y={675-Math.cos(t*1.45)*18} color={palette[1]} pose={t>4?'think':'argue'} phase={t+.4} flip/><Robot x={390+Math.sin(t*1.1)*85} y={450+Math.cos(t*1.1)*24} s={.85} color={palette[2]} pose="think" phase={t+.7}/>
 <Paper x={360+Math.sin(t*2)*155} y={475-Math.cos(t*2)*95} angle={Math.sin(t*2)*25} color={palette[0]}/><Paper x={360-Math.sin(t*2)*155} y={475+Math.cos(t*2)*95} angle={-Math.sin(t*2)*25} color={palette[1]}/>
 {t>1.7&&t<4.5&&<><Burst x={365} y={590} s={.7+.12*Math.sin(t*9)}/><text x="345" y="600" fill="#172238" fontSize="35" fontWeight="900">?</text></>}
 {t>=4.5&&<g><path d="M230 575Q340 340 505 570" fill="none" stroke="#73879c" strokeWidth="4" strokeDasharray="10 9" strokeDashoffset={-f*2}/><path d="m486 566 22 9-3-23" fill="none" stroke="white" strokeWidth="4"/></g>}
 <Title y={995} size={28}>{t<2?'READ EACH OTHER’S ARGUMENTS':t<4?'FIND THE WEAK ASSUMPTION':'CHANGE YOUR MIND WHEN IT MAKES SENSE'}</Title></svg>};
export const Verdict=()=>{const f=useCurrentFrame();const t=f/30;const p=Math.min(1,t/1.2);return <svg width="720" height="1280"><Backdrop/><Title y={150} size={56}>A STRONGER PLAN</Title>
 {[0,1,2].map(i=><g key={i}><Robot x={145+i*215+(1-ease((f-i*5)/27))*(i===2?180:-180)} y={790-Math.sin(Math.max(0,Math.min(1,(f-48-i*8)/25))*Math.PI)*35} s={.75} color={palette[i]} pose="win" phase={t+i}/><Paper x={(145+i*215)*(1-p)+360*p} y={520-100*p} angle={(i-1)*15*(1-p)} color={palette[i]} mark={p>=1?'check':'lines'}/></g>)}
 <path d="M155 665Q155 580 330 510m235 155Q565 580 390 510" stroke="#aac1d7" strokeWidth="3" fill="none"/>
 <Title y={585} size={29}>RECOMMENDATION</Title><g opacity={Math.min(1,Math.max(0,(t-1.6)*2))}><Title y={633} size={27}>+ THE REASONING</Title></g><g opacity={Math.min(1,Math.max(0,(t-3.4)*2))}><Title y={985} size={27}>KEEP THE IMPORTANT DISAGREEMENTS</Title><path d="M607 825v90m0-90 40 12-40 13" fill="#f4bf6b" stroke="#172238" strokeWidth="4"/></g></svg>};
export const Install:React.FC<{step:number}>=({step})=>{const f=useCurrentFrame();const t=f/30;return <svg width="720" height="1280"><Backdrop/><Title y={145} size={53}>{step===1?'ADD COUNCIL TO CODEX':'GIVE IT SOMETHING TO DEBATE'}</Title>
 <Robot x={590} y={345} s={.7} color={palette[0]} pose="think" phase={t}/>
 <text x="60" y="325" fill="#172238" fontSize="25" fontWeight="700">{step===1?'PASTE THIS INTO YOUR CODEX CHAT':'OPEN A NEW CHAT, THEN ASK:'}</text>
 {step===1?<>
 <text x="60" y="415" fill="#172238" fontSize="34" fontWeight="700"><tspan x="60">Install the council skill from</tspan><tspan x="60" dy="48">tsenart/council-skill</tspan><tspan x="60" dy="48">for Codex using:</tspan></text>
 <text x="60" y="670" fill="#172238" fontFamily="Menlo,monospace" fontSize="29"><tspan x="60">npx skills add</tspan><tspan x="60" dy="44">tsenart/council-skill</tspan><tspan x="60" dy="44">--skill council -a codex -g</tspan></text>
 <Title y={930} size={26}>FOLLOW THE SETUP PROMPTS</Title>
 </>:<>
 <text x="60" y="450" fill="#172238" fontSize="36" fontWeight="700"><tspan x="60">Use $council with three</tspan><tspan x="60" dy="51">independent subagents to</tspan><tspan x="60" dy="51">stress-test my AI project.</tspan><tspan x="60" dy="90">Show the debate and</tspan><tspan x="60" dy="51">your recommendation.</tspan></text>
 <g transform="translate(0,85)"><Robot x={160} y={765} s={.52} phase={t} color={palette[0]}/><Robot x={360} y={765} s={.52} phase={t+.6} color={palette[1]}/><Robot x={560} y={765} s={.52} phase={t+1} color={palette[2]}/></g>
 </>}
 </svg>};
