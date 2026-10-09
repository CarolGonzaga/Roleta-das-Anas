import { Candy, HeartHandshake, UtensilsCrossed, ShoppingBag, Coffee, BedDouble, HandHeart, CupSoda, Clock, IceCreamBowl, Sparkles } from 'lucide-react';
const icons = {Candy,HeartHandshake,UtensilsCrossed,ShoppingBag,Coffee,BedDouble,HandHeart,CupSoda,Clock,IceCreamBowl};
export function PrizeIcon({name,size=24}:{name:string;size?:number}) { const Component = icons[name as keyof typeof icons] ?? Sparkles; return <Component size={size} aria-hidden="true" strokeWidth={1.4}/>; }
