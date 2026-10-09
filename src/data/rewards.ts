import type { Reward } from '../types';
export const rewards: Reward[] = [
 {id:1,name:'Chocolate',shortName:'Chocolate',description:'Um chocolatinho para adoçar a vida da minha gatinha. Porque você merece!',icon:'Candy',category:'Gostosuras'},
 {id:2,name:'Massagem VIP',shortName:'Massagem VIP',description:'Você acaba de ganhar uma sessão de massagem especial, com muito carinho e dedicação da sua mulher.',icon:'HeartHandshake',category:'Carinho'},
 {id:3,name:'1 delivery de qualquer coisa',shortName:'Delivery',description:'Hoje você escolhe o que quiser comer. Sua mulher cuida do pedido!',icon:'UtensilsCrossed',category:'Gostosuras'},
 {id:4,name:'Vale-compras de R$ 100',shortName:'Vale-compras',description:'Um mimo de R$ 100 para você comprar alguma coisinha que tenha vontade.',icon:'ShoppingBag',category:'Presentes'},
 {id:5,name:'30 minutos sem tarefas',shortName:'30 min de paz',description:'Você ganhou meia horinha de descanso merecido. Pode relaxar, meu amor.',icon:'Coffee',category:'Descanso'},
 {id:6,name:'2 horas sem tarefas de casa',shortName:'2 horas de paz',description:'Durante duas horas, nada de tarefas domésticas para você. Aproveita seu descanso!',icon:'BedDouble',category:'Descanso'},
 {id:7,name:'Sua mulher deverá limpar um cocô',shortName:'Vale-limpeza',description:'Parabéns, gatinha! Você acaba de ganhar um vale-limpeza de cocô. Essa missão desagradável agora é toda da Carol.',icon:'HandHeart',category:'Cuidado'},
 {id:8,name:'Copo de açaí',shortName:'Açaí',description:'Um açaí gostoso para a mulher mais linda desse universo.',icon:'CupSoda',category:'Gostosuras'},
 {id:9,name:'1 hora sem tarefas',shortName:'1 hora de paz',description:'Uma hora inteirinha para fazer absolutamente o que você quiser. Você merece esse tempinho.',icon:'Clock',category:'Descanso'},
].map(r => ({...r,weight:1,enabled:true,maxAwards:null}));
