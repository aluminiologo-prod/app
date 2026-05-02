import { Image, View, type ImageStyle, type StyleProp } from 'react-native';
import { Package } from 'lucide-react-native';
import { useSignedUrl } from '../../hooks/useSignedUrl';

interface SignedImageProps {
  path: string | null | undefined;
  alt?: string;
  className?: string;
  style?: StyleProp<ImageStyle>;
  fallbackIconSize?: number;
}

export function SignedImage({
  path,
  className,
  style,
  fallbackIconSize = 20,
}: SignedImageProps) {
  const { url } = useSignedUrl(path);

  if (!url) {
    return (
      <View className={`items-center justify-center bg-[#F4F4F5] ${className ?? ''}`}>
        <Package size={fallbackIconSize} color="#A1A1AA" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      className={className}
      style={style}
      resizeMode="cover"
    />
  );
}
