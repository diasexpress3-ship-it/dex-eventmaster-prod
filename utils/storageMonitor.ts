
/**
 * Monitorar uso do plano gratuito (5GB limite)
 * Dex-EventMaster - Utils
 */
export const checkStorageLimits = () => {
  console.log("📊 Firebase Storage - Plano Gratuito:");
  console.log("• Limite total: 5GB");
  console.log("• Recomendado: arquivos até 10MB para otimização");
  console.log("• Dica: Delete arquivos de eventos passados para liberar espaço");
  console.log("• Console: console.firebase.google.com");
};

export const formatBytes = (bytes: number, decimals: number = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
