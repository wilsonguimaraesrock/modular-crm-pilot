import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ContactsManager = () => {
  const { toast } = useToast();
  const [uploadStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    duplicated: 0
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Gerenciamento de Contatos</h2>
          <p className="text-slate-400">Upload e validação de planilhas de contatos</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Upload className="mr-2" size={20} />
            Upload da Planilha Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Arraste sua planilha Excel aqui
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                ou clique para selecionar o arquivo
              </p>
              
              <Button
                onClick={() => toast({
                  title: "🚧 Em desenvolvimento",
                  description: "Funcionalidade de upload em desenvolvimento",
                })}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="mr-2" size={16} />
                Selecionar Arquivo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-white" />
              <div>
                <p className="text-blue-100 text-sm">Total de Contatos</p>
                <p className="text-2xl font-bold text-white">{uploadStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-white" />
              <div>
                <p className="text-green-100 text-sm">Números Válidos</p>
                <p className="text-2xl font-bold text-white">{uploadStats.valid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-white" />
              <div>
                <p className="text-red-100 text-sm">Números Inválidos</p>
                <p className="text-2xl font-bold text-white">{uploadStats.invalid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-white" />
              <div>
                <p className="text-yellow-100 text-sm">Duplicados</p>
                <p className="text-2xl font-bold text-white">{uploadStats.duplicated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 