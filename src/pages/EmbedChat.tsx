import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmbedChatQualificacao } from '@/components/crm/EmbedChatQualificacao';
import { Toaster } from '@/components/ui/toaster';

export const EmbedChat = () => {
  const [searchParams] = useSearchParams();
  const schoolId = searchParams.get('schoolId') || '1';

  // Remover margens e padding do body para embed
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      <EmbedChatQualificacao schoolId={schoolId} />
      <Toaster />
    </>
  );
}; 