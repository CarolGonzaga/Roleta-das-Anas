import type { CardId, TarotCard } from '../types';

export const tarotCards: TarotCard[] = [
 {id:'sun',name:'O Sol',english:'THE SUN',person:'Carol',image:'/tarot/the-sun.png',icon:'Sun',title:'O Sol brilhou para você, gatinha!'},
 {id:'moon',name:'A Lua',english:'THE MOON',person:'Ana Flávia',image:'/tarot/the-moon.png',icon:'Moon',title:'A Lua escolheu minha bruxinha!'},
 {id:'strength',name:'A Força',english:'STRENGTH',person:'Lana',image:'/tarot/strength.png',icon:'Infinity',title:'A Força está com você!'},
 {id:'justice',name:'A Justiça',english:'JUSTICE',person:'Bonnie',image:'/tarot/justice.png',icon:'Scale',title:'A Justiça determinou: você merece um mimo!'},
];
export const cardMessages: Record<CardId, string[]> = {
 sun:[
  'Eu sabia que você conseguiria, meu amor! Você ilumina meus dias de um jeito que nem imagina. Estou muito orgulhosa de você!',
  'Boa, gatinha! Sua mulher está radiante de orgulho!',
  'Você é uma das melhores coisas que já aconteceram na minha vida.',
  'Obrigada por se esforçar por nós. Eu te amo demais!',
  'Meu amor, hoje o sol nasceu só para celebrar você.',
 ],
 moon:[
  'Meu amor, eu sei que às vezes tudo parece mais difícil do que deveria. Mas eu vejo seu esforço, até quando você não percebe. Você é incrível e merece todo o carinho do mundo.',
  'Minha gatinha merece descansar e ser mimada.',
  'Você não precisa dar conta de tudo para ser extraordinária.',
  'Até nos dias nublados, você continua sendo minha lua favorita.',
  'Tenho muito orgulho da mulher maravilhosa que você é.',
 ],
 strength:[
  'Olha só o que você conseguiu, minha gatinha! A força não está em fazer tudo perfeitamente, mas em continuar tentando no seu próprio ritmo. Eu te amo!',
  'Você é muito mais forte do que acredita.',
  'Cada pequeno esforço seu merece ser reconhecido.',
  'A Lana veio lembrar que você é poderosa!',
  'Obrigada por tentar, mesmo quando as coisas parecem difíceis.',
 ],
 justice:[
  'Depois de todo esse esforço, o veredito é unânime: minha gatinha merece ser cuidada, mimada e muito amada!',
  'A Bonnie analisou o caso e decidiu: prêmio para a Ana!',
  'Sua mulher reconhece todo o carinho que você coloca na nossa vida.',
  'Hoje a justiça está do lado dos mimos!',
  'Caso encerrado: você foi maravilhosa!',
 ],
};
