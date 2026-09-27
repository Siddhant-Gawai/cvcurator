import {AlertDialog} from '@heroui/react';
import {TriangleAlert} from 'lucide-react';
import {Button} from './button';
export function ConfirmDialog({open,title,description,onCancel,onConfirm}:{open:boolean;title:string;description:string;onCancel:()=>void;onConfirm:()=>void}) {
 return <AlertDialog.Backdrop isOpen={open} onOpenChange={value=>{if(!value)onCancel();}} isKeyboardDismissDisabled={false} variant="blur">
  <AlertDialog.Container placement="center" size="sm"><AlertDialog.Dialog>
   <AlertDialog.Header><AlertDialog.Icon status="warning"><TriangleAlert size={22}/></AlertDialog.Icon><AlertDialog.Heading>{title}</AlertDialog.Heading></AlertDialog.Header>
   <AlertDialog.Body><p className="text-sm leading-6 text-muted">{description}</p></AlertDialog.Body>
   <AlertDialog.Footer><Button variant="outline" onPress={onCancel} autoFocus>Cancel</Button><Button variant="destructive" onPress={onConfirm}>Confirm</Button></AlertDialog.Footer>
  </AlertDialog.Dialog></AlertDialog.Container>
 </AlertDialog.Backdrop>;
}
