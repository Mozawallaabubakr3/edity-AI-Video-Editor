import React from 'react';
export const palette=['#7dd5d0','#c2a0ee','#f4bf6b'];
const ink='#172238';
export const Robot:React.FC<{x:number;y:number;s?:number;color?:string;pose?:string;phase?:number;flip?:boolean}>=({x,y,s=1,color=palette[0],pose='idle',phase=0,flip=false})=>{
 const step=phase;const bob=pose==='walk'?Math.sin(step*12)*5:Math.sin(step*3)*2;const arm=pose==='argue'?Math.sin(step*9)*18:pose==='think'?-34+Math.sin(step*4)*9:pose==='win'?-65+Math.sin(step*6)*14:pose==='walk'?Math.sin(step*12)*25:8;
 const blink=Math.floor(phase*30)%113>108;
 return <g transform={`translate(${x},${y+bob}) scale(${flip?-s:s},${s})`} stroke={ink} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
 <ellipse cx="0" cy="112" rx="62" ry="11" fill="#060c1d" opacity=".25" stroke="none"/>
 <g transform={`rotate(${pose==='walk'?Math.sin(step*12)*14:0} -22 65)`}><path d="M-22 58v40h-17" fill="none" strokeWidth="15"/><path d="M-38 103h30" strokeWidth="13" stroke={color}/></g>
 <g transform={`rotate(${pose==='walk'?-Math.sin(step*12)*14:0} 22 65)`}><path d="M22 58v40h17" fill="none" strokeWidth="15"/><path d="M8 103h30" strokeWidth="13" stroke={color}/></g>
 <path d="M-38 5Q-53 36-33 69Q0 83 33 69Q53 36 38 5Z" fill={color}/><path d="M-25 30h50v24h-50z" fill={ink}/><path d="M-14 42h10m11 0h8" stroke="white" strokeWidth="4"/>
 <g transform={`rotate(${-arm} -39 18)`}><path d="M-38 18L-61 43l-4 15" fill="none" strokeWidth="13"/><circle cx="-66" cy="62" r="17" fill={color}/><path d="M-75 58l8 5" strokeWidth="3"/></g>
 {pose!=='fight'&&<g transform={`rotate(${arm} 39 18)`}><path d="M38 18l23 25 4 15" fill="none" strokeWidth="13"/><circle cx="66" cy="62" r="17" fill={color}/><path d="M75 58l-8 5" strokeWidth="3"/></g>}
 <path d="M0-68v-16" fill="none"/><circle cy="-90" r="8" fill={color}/>
 <rect x="-54" y="-68" width="108" height="76" rx="22" fill={color}/><path d="M-36-57h60" stroke="white" opacity=".35" strokeWidth="5"/>
 <rect x="-39" y="-49" width="78" height="37" rx="13" fill={ink}/>
 {blink?<path d="M-25-29h12m26 0h12" stroke="white" strokeWidth="5"/>:<><ellipse cx="-19" cy="-31" rx="5" ry={pose==='argue'?6:9} fill="white" stroke="none"/><ellipse cx="19" cy="-31" rx="5" ry={pose==='argue'?6:9} fill="white" stroke="none"/></>}
 {pose==='argue'&&<path d="M-28-43l16 4m24 0 16-4" stroke={color} strokeWidth="4"/>}
 <path d={pose==='win'?'M-10-4Q0 6 10-4':'M-8-4h16'} fill="none" strokeWidth="3"/>
 </g>
};
export const Bulb:React.FC<{x:number;y:number;s?:number}>=({x,y,s=1})=><g transform={`translate(${x},${y}) scale(${s})`} stroke={ink} strokeWidth="5" strokeLinecap="round"><path d="M-24 10C-68-39-25-81 12-66C48-53 45-16 24 10L18 30h-36z" fill="#f7d16f"/><path d="M-15 38h30m-27 10h24"/><path d="M-9 18V-17l9 8 9-8v35" fill="none" stroke="#ab7035" strokeWidth="3"/>{[-2,-1,0,1,2].map(i=><path key={i} d="M0-90v-13" transform={`rotate(${i*38} 0 -15)`} stroke="#ffe2a0" strokeWidth="4"/>)}</g>;
export const Paper:React.FC<{x:number;y:number;angle?:number;color?:string;mark?:string}>=({x,y,angle=0,color='#7dd5d0',mark='lines'})=><g transform={`translate(${x},${y}) rotate(${angle})`} stroke={ink} strokeWidth="4" strokeLinecap="round"><path d="M-45-58h64l25 24v89h-89z" fill="#fffaf0"/><path d="M19-58v24h25" fill={color}/>{mark==='check'?<path d="M-25 4l17 18 35-39" stroke={color} strokeWidth="9" fill="none"/>:<><path d="M-28-19h38m-38 17h53m-53 17h44m-44 17h32" stroke="#65758c" strokeWidth="4"/><circle cx="-25" cy="-39" r="5" fill={color} stroke="none"/></>}</g>;
export const Ring:React.FC<{h?:number}>=({h=1000})=><g>
 <ellipse cx="360" cy={h-90} rx="335" ry="80" fill="#070e22"/>
 <path d={`M55 ${h-360}L430 ${h-430}L685 ${h-250}L305 ${h-155}Z`} fill="#31496d" stroke="#a4b9d2" strokeWidth="5"/>
 <path d={`M55 ${h-360}v38l250 194v-27z`} fill="#243754"/><path d={`M305 ${h-155}L685 ${h-250}v38l-380 84z`} fill="#1d304d"/>
 {[0,1,2].map(i=><path key={i} d={`M55 ${h-505+i*42}L430 ${h-575+i*42}L685 ${h-395+i*42}L305 ${h-300+i*42}Z`} stroke={i===1?'#c2a0ee':'#d0dcee'} strokeWidth="7" fill="none"/>)}
 {[[55,h-520],[430,h-590],[685,h-410],[305,h-315]].map(([x,y],i)=><g key={i}><path d={`M${x} ${y}v174`} stroke="#121d32" strokeWidth="16"/><rect x={x-12} y={y+17} width="24" height="72" rx="8" fill={palette[i%3]}/></g>)}
 </g>;
export const Burst:React.FC<{x:number;y:number;s?:number}>=({x,y,s=1})=><g transform={`translate(${x},${y}) scale(${s})`}><path d="M0-45l12 24 28-10-10 28 25 15-29 6 5 30-24-18-23 21 1-31-31-4 26-17-12-27 29 8z" fill="#f5cc7a" stroke={ink} strokeWidth="4"/></g>;
