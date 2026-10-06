import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Robot,Bulb,Paper,Burst,palette} from './Art';
import {Backdrop} from './Scenes';
const ink='#172238';
const smooth=(v:number)=>{const p=Math.min(1,Math.max(0,v));return p*p*(3-2*p)};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
const Heading:React.FC<{children:React.ReactNode;y?:number;size?:number}>=({children,y=155,size=42})=><text x="360" y={y} textAnchor="middle" fill={ink} fontFamily="Arial" fontSize={Math.min(size,630/(String(children).length*.64))} fontWeight="900">{children}</text>;
const Sheet:React.FC<{x:number;y:number;s?:number;angle?:number;color?:string;check?:boolean;reveal?:number}>=({x,y,s=1,angle=0,color,check=false,reveal=1})=><g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}><Paper x={0} y={0} color={color} mark={check?'check':'lines'}/>{reveal<1&&<rect x="-32" y={-25+reveal*68} width="62" height={(1-reveal)*68} fill="#fffaf0"/>}</g>;
export const Fight:React.FC<{compact?:boolean}>=({compact=true})=>{
 const f=useCurrentFrame(),t=f/30;const enter=1;const beat=(f%24)/24;const punch=Math.sin(beat*Math.PI);const leftTurn=Math.floor(f/24)%2===0;const reach=Math.pow(punch,3);
 const left=240+reach*(leftTurn?35:-15),right=480-reach*(leftTurn?-15:35);
 return <svg width="720" height={compact?500:1280} viewBox={compact?'0 0 720 500':'0 -200 720 1280'}><Backdrop/>
 <ellipse cx="360" cy="418" rx="260" ry="24" fill="#edf1f5"/>
 <Bulb x={360} y={95+Math.sin(t*4)*5} s={.5}/>
 <g transform={`translate(${mix(-100,left,enter)} 293) rotate(${leftTurn?-reach*7:reach*9})`}><Robot x={0} y={-Math.abs(Math.sin(t*7))*9} s={.9} pose="fight" phase={t} color={palette[0]}/></g>
 <g transform={`translate(${mix(820,right,enter)} 293) rotate(${leftTurn?-reach*9:reach*7})`}><Robot x={0} y={-Math.abs(Math.sin(t*7+.7))*9} s={.9} pose="fight" phase={t+.4} color={palette[1]} flip/></g>
 {/* Boxing gloves are articulated on the action side, with extension and recoil. */}
 <path d={`M${left+35} 307Q${left+62} ${255-reach*15} ${left+75+(leftTurn?reach*74:0)} ${260+reach*13}`} stroke={ink} strokeWidth="13" fill="none" strokeLinecap="round"/>
 <ellipse cx={left+81+(leftTurn?reach*74:0)} cy={260+reach*13} rx="27" ry="23" fill={palette[0]} stroke={ink} strokeWidth="5" transform={`rotate(${-reach*20} ${left+81+(leftTurn?reach*74:0)} ${260+reach*13})`}/>
 <path d={`M${right-35} 307Q${right-62} ${255-reach*15} ${right-75-(!leftTurn?reach*74:0)} ${260+reach*13}`} stroke={ink} strokeWidth="13" fill="none" strokeLinecap="round"/>
 <ellipse cx={right-81-(!leftTurn?reach*74:0)} cy={260+reach*13} rx="27" ry="23" fill={palette[1]} stroke={ink} strokeWidth="5"/>
 {punch>.92&&<Burst x={leftTurn?right-55:left+55} y={250} s={.35+(punch-.92)*3}/>}
 {[0,1,2].map(i=><path key={i} d={`M${leftTurn?left-85-i*13:right+85+i*13} ${285+i*15}h${leftTurn?-25:25}`} stroke={palette[leftTurn?0:1]} strokeWidth="4" strokeLinecap="round" opacity={reach}/>)}</svg>;
};
export const InstallAction:React.FC<{step:number;frame?:number}>=({step,frame})=>{
 const local=useCurrentFrame();const f=frame??local,t=f/30;
 const lines=step===1?['Install the council skill','from tsenart/council-skill','for Codex using:','','npx skills add','tsenart/council-skill','--skill council -a codex -g']:['Use $council with three','independent subagents to','stress-test my AI project.','','Show the debate and','your recommendation.'];
 const text=lines.join('\n');const count=Math.floor(smooth((f-15)/(step===1?112:85))*text.length);const typed=text.slice(0,count).split('\n');const row=typed.length-1,col=typed[row].length;const zoom=1+smooth(f/(step===1?185:131))*.045;
 return <svg width="720" height="1280"><Backdrop/><Heading size={40}>{step===1?'ADD THE COUNCIL':'START THE CONVERSATION'}</Heading>
 <g transform={`translate(360 570) scale(${zoom}) translate(-360 -570)`}>
 {/* An illustrated physical laptop, not a fabricated recording or install result. */}
 <rect x="52" y="278" width="616" height="478" rx="22" fill={ink}/><rect x="67" y="294" width="586" height="440" rx="10" fill="#f6f8fa"/><circle cx="360" cy="286" r="3" fill="#889aaa"/>
 <text x="93" y="334" fontFamily="Arial" fontSize="24" fontWeight="800" fill={ink}>Codex</text><path d="M86 352h548" stroke="#d2dce6" strokeWidth="2"/>
 {typed.map((line,i)=><text key={i} x="94" y={395+i*41} fill={ink} fontFamily="Menlo,monospace" fontSize="21">{line}</text>)}
 <rect x={94+col*12.65} y={377+row*41} width="3" height="24" fill={ink} opacity={count<text.length?1:.3+.7*(.5+.5*Math.sin(t*8))}/>
 <path d="M52 756h616l35 115Q360 903 17 871Z" fill="#dce5ed" stroke={ink} strokeWidth="5"/>
 {[0,1,2,3].map(r=>Array.from({length:11},(_,c)=><rect key={`${r}-${c}`} x={80+c*50-r*3} y={774+r*19} width="39" height="13" rx="3" fill={Math.floor(f/2)%44===r*11+c&&count<text.length?palette[(r+c)%3]:'#a8b7c6'}/>))}
 <path d="M292 861h137" stroke="#a8b7c6" strokeWidth="8" strokeLinecap="round"/>
 {/* Hands press alternating keys instead of a static image of a keyboard. */}
 <g transform={`translate(${200+Math.sin(t*7)*65} ${818+Math.sin(t*18)*5}) rotate(${Math.sin(t*6)*9})`}><ellipse rx="25" ry="16" fill={palette[0]} stroke={ink} strokeWidth="4"/><path d="M-10-8v10m10-12v12m10-10v9" stroke={ink} strokeWidth="2"/></g>
 <g transform={`translate(${510+Math.sin(t*6+1)*48} ${818+Math.sin(t*17)*5}) rotate(${Math.sin(t*5)*9})`}><ellipse rx="25" ry="16" fill={palette[0]} stroke={ink} strokeWidth="4"/><path d="M-10-8v10m10-12v12m10-10v9" stroke={ink} strokeWidth="2"/></g>
 </g>
 <Heading y={987} size={25}>{step===1?'FOLLOW THE SETUP PROMPTS':'YOUR IDEA → THREE PERSPECTIVES'}</Heading>
 </svg>;
};
export const ThinkingAction:React.FC<{frame?:number}>=({frame})=>{
 const local=useCurrentFrame();const f=frame??local,t=f/30;
 return <svg width="720" height="1280"><Backdrop/><Heading>THREE INDEPENDENT TAKES</Heading>
 {[0,1,2].map(i=>{const enter=smooth((f-i*5)/20);const write=smooth((f-25-i*10)/45);const bounce=Math.sin(t*6+i)*4;return <g key={i} transform={`translate(${120+i*240} ${mix(1150,580,enter)})`}>
 <Robot x={0} y={0} s={.8} pose={f<30?'walk':'argue'} phase={t+i} color={palette[i]}/>
 <path d="M-91 90h182m-158 0v120m134-120v120" stroke={ink} strokeWidth="7" fill="none"/>
 <g transform={`translate(${Math.sin(t*3+i)*7} ${-140+bounce}) rotate(${Math.sin(t*2+i)*5})`}><Sheet x={0} y={0} color={palette[i]} s={1.1} reveal={write}/>
 <path d={`M${-20+Math.sin(t*12+i)*28} ${-10+write*38}l20-38`} stroke={palette[i]} strokeWidth="8" strokeLinecap="round"/>
 <path d={`M${-20+Math.sin(t*12+i)*28} ${-10+write*38}l-3 7`} stroke={ink} strokeWidth="4"/>
 </g>
 {f>65+i*10&&<g transform={`translate(0 ${-250-smooth((f-65-i*10)/18)*45}) scale(${smooth((f-65-i*10)/18)})`}><Bulb x={0} y={0} s={.45}/></g>}
 </g>})}
 <path d="M240 310v490m240-490v490" stroke="#ced7e2" strokeDasharray="8 12" strokeWidth="3"/><Heading y={960} size={27}>FORM AN OPINION BEFORE COMPARING</Heading></svg>;
};
export const DebateAction:React.FC<{frame?:number}>=({frame})=>{
 const local=useCurrentFrame();const f=frame??local,t=f/30;const stage=f<65?0:f<137?1:2;const cycle=(f%65)/65;
 return <svg width="720" height="1280"><Backdrop/><Heading>{['READ THE ARGUMENTS','CHALLENGE THE ASSUMPTIONS','RECONSIDER THE ANSWER'][stage]}</Heading>
 <ellipse cx="360" cy="837" rx="285" ry="54" fill="#eff3f6"/>
 {[0,1,2].map(i=>{const x=160+i*200+(stage===1?Math.sin(t*3+i)*22:Math.sin(t*1.5+i)*9);const y=i===1?430:685;const next=(i+1)%3;const destX=160+next*200;const destY=next===1?330:575;const p=smooth(cycle);const paperX=stage===0?mix(x,destX,p):x;const paperY=stage===0?mix(y-120,destY,p)-Math.sin(p*Math.PI)*65:y-140+Math.sin(t*3+i)*12;return <g key={i}>
 <Robot x={x} y={y} s={.92} pose={stage===0?'think':stage===1?'argue':'win'} phase={t+i} color={palette[i]} flip={i===2}/>
 <Sheet x={paperX} y={paperY} angle={Math.sin(t*2+i)*12} s={.78} color={palette[i]} check={stage===2&&i!==2}/>
 {stage===1&&<g transform={`translate(${x+48} ${y-90}) rotate(${Math.sin(t*4+i)*9})`}><text fill={ink} fontSize="65" fontWeight="900">?</text><path d="M-4 10h50" stroke={palette[i]} strokeWidth="7" strokeLinecap="round" strokeDasharray="50" strokeDashoffset={50*(1-smooth((f-65-i*8)/18))}/></g>}
 {stage===2&&i===2&&<g transform={`translate(${x+45} ${y-85}) rotate(${Math.sin(t*4)*9})`}><path d="M0 0v65m0-65 42 10-42 15" fill={palette[2]} stroke={ink} strokeWidth="4"/></g>}
 </g>})}
 {stage===0&&<path d="M155 555Q105 330 320 325m110 0Q610 325 565 540M470 710Q360 795 250 710" fill="none" stroke="#b7c7d5" strokeWidth="3" strokeDasharray="8 8" strokeDashoffset={-f*3}/>}
 <Heading y={955} size={26}>{['COMPARE WHAT EACH AGENT THINKS','EXPLAIN WHY YOU DISAGREE','CHANGE YOUR MIND — OR KEEP THE OBJECTION'][stage]}</Heading></svg>;
};
export const ResultAction:React.FC<{frame?:number}>=({frame})=>{
 const local=useCurrentFrame();const f=frame??local,t=f/30;
 return <svg width="720" height="1280"><Backdrop/><Heading>A RECOMMENDATION + WHY</Heading>
 {[0,1,2].map(i=>{const p=smooth((f-i*7)/32);return <g key={i}>
 <Robot x={145+i*215+Math.sin(t*2+i)*8} y={785-Math.max(0,Math.sin((t-i*.18)*4))*14} s={.78} pose={f<45?'argue':'win'} phase={t+i} color={palette[i]}/>
 <Sheet x={mix(145+i*215,360,p)} y={mix(650,425,p)-Math.sin(p*Math.PI)*70} angle={(i-1)*20*(1-p)} s={mix(.6,1.4,p)} color={palette[i]} check={p>.95}/>
 </g>})}
 {f>48&&[0,1,2].map(i=><g key={i} opacity={smooth((f-48-i*10)/16)} transform={`translate(${115+i*245} ${590+Math.sin(t*2+i)*5})`}><circle r="23" fill={palette[i]}/><text y="8" textAnchor="middle" fontWeight="800" fontSize="23" fill={ink}>{i+1}</text><path d={`M0-29Q${(1-i)*45} -80 ${(1-i)*245}-98`} fill="none" stroke={palette[i]} strokeWidth="4" strokeDasharray="6 7" strokeDashoffset={-f*2}/></g>)}
 {f>108&&<g transform={`translate(${610} ${mix(1000,885,smooth((f-108)/20))}) rotate(${Math.sin(t*4)*8})`}><path d="M0 0v65m0-65 45 12-45 15" fill={palette[2]} stroke={ink} strokeWidth="4"/></g>}
 <Heading y={969} size={25}>{f<110?'FOLLOW THE REASONING':'KEEP THE DISAGREEMENTS THAT MATTER'}</Heading></svg>;
};
export const EndingAction:React.FC<{frame?:number}>=({frame})=>{
 const local=useCurrentFrame();const f=frame??local,t=f/30;const phase=f<69?0:f<218?1:2;
 return <svg width="720" height="1280"><Backdrop/><Heading size={phase===0?37:42}>{phase===0?'A RECOMMENDATION ≠ A GUARANTEE':phase===1?'CHALLENGE IT BEFORE YOU BUILD':'TRY THE COUNCIL'}</Heading>
 {phase===0?<>
 <g transform={`translate(360 ${430+Math.sin(t*3)*12}) rotate(${Math.sin(t*2)*8})`}><Sheet x={0} y={0} s={1.3} check color={palette[0]}/><text x="58" y="-40" fill={ink} fontSize="75" fontWeight="900">?</text></g>
 <Robot x={360+Math.sin(t*2)*35} y={735} s={1.4} pose="think" phase={t} color={palette[2]}/>
 </>:<>
 {/* A small project is assembled block by block, rather than cutting back to reading glances. */}
 {[0,1,2,3,4,5].map(i=>{const p=smooth((f-75-i*15)/23);const x=250+(i%3)*82,y=620-Math.floor(i/3)*80;return <g key={i} transform={`translate(${mix(i%2?-90:810,x,p)} ${y-Math.sin(p*Math.PI)*110}) rotate(${(1-p)*(i%2?80:-80)})`}><rect width="73" height="73" rx="10" fill={palette[i%3]} stroke={ink} strokeWidth="4"/><path d="M18 30l-8 8 8 8m37-16 8 8-8 8m-20-19-9 34" fill="none" stroke={ink} strokeWidth="3"/></g>})}
 <Robot x={145+Math.sin(t*2)*20} y={785-Math.abs(Math.sin(t*4))*9} s={.92} pose={phase===1?'argue':'win'} phase={t} color={palette[0]}/>
 <Robot x={570-Math.sin(t*2)*20} y={785-Math.abs(Math.sin(t*4+.5))*9} s={.92} pose={phase===1?'argue':'win'} phase={t+.6} color={palette[1]} flip/>
 <Bulb x={360} y={350+Math.sin(t*3)*10} s={.8}/>
 {phase===2&&<g transform={`translate(360 ${775+Math.sin(t*3)*8}) scale(${smooth((f-218)/20)})`}><Robot x={0} y={0} s={1.1} pose="win" phase={t+1} color={palette[2]}/></g>}
 </>}
 </svg>;
};
