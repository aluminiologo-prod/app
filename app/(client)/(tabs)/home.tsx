import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react-native';
import { ComingSoonScreen } from '../../../src/components/ui/ComingSoonScreen';

export default function ClientHomeScreen() {
  const { t } = useTranslation('profile');
  return (
    <ComingSoonScreen
      icon={Home}
      title={t('grid.comingSoon')}
      subtitle={t('completeness.subtitle')}
    />
  );
}
