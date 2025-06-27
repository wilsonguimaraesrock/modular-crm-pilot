import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { RockfellerLogo } from '@/components/ui/logo';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const isMobile = useIsMobile();
  const { loginAsSchool, loginAsSeller, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [schoolForm, setSchoolForm] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  const [sellerForm, setSellerForm] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [showRegister, setShowRegister] = useState(false);

  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolForm.email || !schoolForm.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const success = await loginAsSchool(schoolForm.email, schoolForm.password);
    
    if (!success) {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao CRM Rockfeller",
      });
    }
  };

  const handleSellerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sellerForm.email || !sellerForm.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const success = await loginAsSeller(sellerForm.email, sellerForm.password);
    
    if (!success) {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos, ou vendedor inativo",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao CRM Rockfeller",
      });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: isMobile ? 10 : 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className={`w-full ${isMobile ? 'max-w-md' : 'max-w-2xl'}`}
      >
        {/* Header */}
        <motion.div variants={item} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <RockfellerLogo size={isMobile ? 'xlarge' : 'xxlarge'} />
          </div>
          <h1 className={`${
            isMobile ? 'text-2xl' : 'text-4xl'
          } font-bold text-white mb-2`}>
            CRM ROCKFELLER
          </h1>
          <p className={`text-slate-400 ${
            isMobile ? 'text-sm' : 'text-lg'
          }`}>
            Sistema Inteligente de Gestão de Leads
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div variants={item}>
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader className={isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}>
              <CardTitle className={`text-white text-center ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
                Acesse sua conta
              </CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-4 pt-2' : 'p-6 pt-2'}>
              <Tabs defaultValue="school" className="w-full">
                <TabsList className={`grid w-full grid-cols-2 mb-6 ${
                  isMobile ? 'h-12' : ''
                }`}>
                  <TabsTrigger 
                    value="school" 
                    className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
                      isMobile ? 'text-xs px-2' : ''
                    }`}
                  >
                    <Building2 className={`${
                      isMobile ? 'mr-1' : 'mr-2'
                    }`} size={isMobile ? 14 : 16} />
                    Escola
                  </TabsTrigger>
                  <TabsTrigger 
                    value="seller" 
                    className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
                      isMobile ? 'text-xs px-2' : ''
                    }`}
                  >
                    <User className={`${
                      isMobile ? 'mr-1' : 'mr-2'
                    }`} size={isMobile ? 14 : 16} />
                    Vendedor
                  </TabsTrigger>
                </TabsList>

                {/* School Login */}
                <TabsContent value="school">
                  <form onSubmit={handleSchoolLogin} className={`space-y-${isMobile ? '4' : '6'}`}>
                    <div className="space-y-2">
                      <Label htmlFor="school-email" className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        E-mail da Escola
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 ${
                          isMobile ? 'w-4 h-4' : 'w-5 h-5'
                        }`} />
                        <Input
                          id="school-email"
                          type="email"
                          value={schoolForm.email}
                          onChange={(e) => setSchoolForm({...schoolForm, email: e.target.value})}
                          className={`${
                            isMobile ? 'pl-10 h-12 text-sm' : 'pl-12'
                          } bg-slate-700/50 border-slate-600 text-white`}
                          placeholder="admin@rockfeller.com.br"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="school-password" className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 ${
                          isMobile ? 'w-4 h-4' : 'w-5 h-5'
                        }`} />
                        <Input
                          id="school-password"
                          type="password"
                          value={schoolForm.password}
                          onChange={(e) => setSchoolForm({...schoolForm, password: e.target.value})}
                          className={`${
                            isMobile ? 'pl-10 h-12 text-sm' : 'pl-12'
                          } bg-slate-700/50 border-slate-600 text-white`}
                          placeholder="Digite sua senha"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 ${
                        isMobile ? 'h-12' : 'h-12'
                      }`}
                    >
                      <LogIn className={`${
                        isMobile ? 'mr-1' : 'mr-2'
                      }`} size={isMobile ? 16 : 18} />
                      {isLoading ? 'Entrando...' : 'Entrar como Escola'}
                    </Button>
                  </form>
                </TabsContent>

                {/* Seller Login */}
                <TabsContent value="seller">
                  <form onSubmit={handleSellerLogin} className={`space-y-${isMobile ? '4' : '6'}`}>
                    <div className="space-y-2">
                      <Label htmlFor="seller-email" className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        E-mail do Vendedor
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 ${
                          isMobile ? 'w-4 h-4' : 'w-5 h-5'
                        }`} />
                        <Input
                          id="seller-email"
                          type="email"
                          value={sellerForm.email}
                          onChange={(e) => setSellerForm({...sellerForm, email: e.target.value})}
                          className={`${
                            isMobile ? 'pl-10 h-12 text-sm' : 'pl-12'
                          } bg-slate-700/50 border-slate-600 text-white`}
                          placeholder="vendedor@rockfeller.com.br"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="seller-password" className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 ${
                          isMobile ? 'w-4 h-4' : 'w-5 h-5'
                        }`} />
                        <Input
                          id="seller-password"
                          type="password"
                          value={sellerForm.password}
                          onChange={(e) => setSellerForm({...sellerForm, password: e.target.value})}
                          className={`${
                            isMobile ? 'pl-10 h-12 text-sm' : 'pl-12'
                          } bg-slate-700/50 border-slate-600 text-white`}
                          placeholder="Digite sua senha"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 ${
                        isMobile ? 'h-12' : 'h-12'
                      }`}
                    >
                      <LogIn className={`${
                        isMobile ? 'mr-1' : 'mr-2'
                      }`} size={isMobile ? 16 : 18} />
                      {isLoading ? 'Entrando...' : 'Entrar como Vendedor'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Demo Credentials */}
              <div className={`mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600`}>
                <h4 className={`text-white font-medium mb-2 ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  Credenciais de Acesso:
                </h4>
                <div className={`space-y-1 ${
                  isMobile ? 'text-xs' : 'text-sm'
                } text-slate-400`}>
                  <p><strong>Admin Sede:</strong> admin@rockfeller.com.br / admin123</p>
                  <p><strong>Vendedores:</strong> Configure na aba Equipe</p>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center mt-6">
                <p className={`text-slate-400 ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  Não tem conta?{' '}
                  <button
                    onClick={() => setShowRegister(true)}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Cadastre sua escola
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}; 