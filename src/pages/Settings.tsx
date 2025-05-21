
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Textarea 
} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Switch
} from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [emailSettings, setEmailSettings] = useState({
    sendWelcomeEmail: true,
    sendInterviewReminder: true,
    sendTestReminder: true,
    ccRecruiter: true,
  });
  
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Empresa ABC",
    defaultLanguage: "pt-BR",
    timeZone: "America/Sao_Paulo",
    privacyNotice: "De acordo com a Lei Geral de Proteção de Dados (LGPD), os dados coletados neste processo seletivo serão utilizados exclusivamente para fins de recrutamento e seleção.",
  });
  
  const { toast } = useToast();

  const handleEmailSettingChange = (setting: keyof typeof emailSettings) => {
    setEmailSettings({
      ...emailSettings,
      [setting]: !emailSettings[setting],
    });
  };

  const handleSaveGeneralSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações gerais foram salvas com sucesso.",
    });
  };

  const handleSaveEmailSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de email foram salvas com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da plataforma</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="email">Notificações por E-mail</TabsTrigger>
          <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          <TabsTrigger value="integration">Integrações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Gerencie as configurações gerais da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nome da Empresa</Label>
                <Input
                  id="company-name"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma Padrão</Label>
                  <Select
                    value={generalSettings.defaultLanguage}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, defaultLanguage: value})}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Selecionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={generalSettings.timeZone}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, timeZone: value})}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Selecionar fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-4)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+1)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (GMT+2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneralSettings}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Email</CardTitle>
              <CardDescription>
                Gerencie quando e como os emails serão enviados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="welcome-email">Email de Boas-Vindas</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar email de boas-vindas quando um candidato é registrado
                    </p>
                  </div>
                  <Switch
                    id="welcome-email"
                    checked={emailSettings.sendWelcomeEmail}
                    onCheckedChange={() => handleEmailSettingChange('sendWelcomeEmail')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="interview-reminder">Lembrete de Entrevista</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembrete 24h antes da entrevista agendada
                    </p>
                  </div>
                  <Switch
                    id="interview-reminder"
                    checked={emailSettings.sendInterviewReminder}
                    onCheckedChange={() => handleEmailSettingChange('sendInterviewReminder')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="test-reminder">Lembrete de Teste</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembrete sobre testes não iniciados após 48h
                    </p>
                  </div>
                  <Switch
                    id="test-reminder"
                    checked={emailSettings.sendTestReminder}
                    onCheckedChange={() => handleEmailSettingChange('sendTestReminder')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cc-recruiter">CC Recrutador</Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir o recrutador em cópia nos emails enviados aos candidatos
                    </p>
                  </div>
                  <Switch
                    id="cc-recruiter"
                    checked={emailSettings.ccRecruiter}
                    onCheckedChange={() => handleEmailSettingChange('ccRecruiter')}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveEmailSettings}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Privacidade</CardTitle>
              <CardDescription>
                Configure os aspectos de privacidade e LGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="privacy-notice">Aviso de Privacidade (LGPD)</Label>
                <Textarea
                  id="privacy-notice"
                  value={generalSettings.privacyNotice}
                  onChange={(e) => setGeneralSettings({...generalSettings, privacyNotice: e.target.value})}
                  rows={5}
                />
                <p className="text-sm text-muted-foreground">
                  Este aviso será exibido em todos os formulários de candidatura
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneralSettings}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Conecte a plataforma com outros serviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Google Calendar</h3>
                    <p className="text-sm text-muted-foreground">
                      Integração para sincronização de entrevistas
                    </p>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Microsoft Teams</h3>
                    <p className="text-sm text-muted-foreground">
                      Integração para videochamadas
                    </p>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">WhatsApp Business API</h3>
                    <p className="text-sm text-muted-foreground">
                      Integração para envio de mensagens
                    </p>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">LinkedIn</h3>
                    <p className="text-sm text-muted-foreground">
                      Integração para importação de currículos
                    </p>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
