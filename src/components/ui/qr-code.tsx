import QRCode from "qrcode";

interface QRCodeImgProps {
  value: string;
  size?: number;
  className?: string;
}

export async function QRCodeImg({ value, size = 100, className }: QRCodeImgProps) {
  const dataUrl = await QRCode.toDataURL(value, {
    width: size,
    margin: 1,
    color: { dark: "#111827", light: "#ffffff" },
  });
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={dataUrl} alt={`QR Code: ${value}`} width={size} height={size} className={className} />
  );
}
