import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react-native';
import { ComingSoonScreen } from '../../../src/components/ui/ComingSoonScreen';

export default function ClientOrdersScreen() {
  const { t } = useTranslation('profile');
  return (
    <ComingSoonScreen
      icon={ShoppingBag}
      title={t('grid.orders')}
      subtitle={t('grid.comingSoon')}
    />
  );
}
