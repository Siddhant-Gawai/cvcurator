import { Button as HeroButton, Tooltip } from '@heroui/react';
import type { ComponentProps } from 'react';
type Props = Omit<ComponentProps<typeof HeroButton>, 'variant' | 'size'> & {
 variant?: 'default' | 'outline' | 'ghost' | 'destructive';
 size?: 'default' | 'sm' | 'icon'; disabled?: boolean; title?:string;
};
export function Button({variant='default',size='default',disabled,className,title,...props}:Props) {
 const button=<HeroButton variant={variant==='default'?'primary':variant==='destructive'?'danger':variant} size={size==='default'?'md':'sm'} isIconOnly={size==='icon'} isDisabled={disabled} className={`folio-button ${typeof className==='string'?className:''}`} {...props}/>;
 return title?<Tooltip>{button}<Tooltip.Content>{title}</Tooltip.Content></Tooltip>:button;
}
