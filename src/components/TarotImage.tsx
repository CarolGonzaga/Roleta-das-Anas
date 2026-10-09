import { useState } from 'react';
import type { TarotCard } from '../types';
export function TarotImage({card,back=false}:{card?:TarotCard|null;back?:boolean}) {
 const [failed,setFailed]=useState(false);
 const label=back?'Verso celestial ornamental do baralho':card?`${card.name} — ${card.person}, carta personalizada ${card.english}`:'Conquista do grimório original';
 if(failed||(!back&&!card)) return <div className="tarot-unavailable" role="img" aria-label={label}><span>{back?'O Oráculo dos Encantos':card?.english??'Uma memória nossa'}</span><strong>{back?'Feito de amor':card?.person??'Grimório original'}</strong></div>;
 return <img className="tarot-image" src={back?'/tarot/card-back.png':card!.image} alt={label} width={941} height={1672} onError={()=>setFailed(true)} draggable={false}/>;
}
