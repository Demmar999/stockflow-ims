import type { ProductIcon } from "@/lib/types";

type IconProps = {
  size?: number;
  className?: string;
  children?: React.ReactNode;
};

const S = ({ size = 18, className, children }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const IconHexagon = (p: IconProps) => (
  <S {...p}>
    <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809-.443 1.555-1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1-2.184 0l-6.75-4.27A2.225 2.225 0 0 1 3 15.502V8.218c0-.809.443-1.555 1.158-1.948l6.75-3.97a2.33 2.33 0 0 1 2.25 0l6.75 3.97h-.033z" />
  </S>
);

export const IconDashboard = (p: IconProps) => (
  <S {...p}>
    <path d="M4 4h6v8H4zM4 16h6v4H4zM14 12h6v8h-6zM14 4h6v4h-6z" />
  </S>
);

export const IconPackage = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" />
  </S>
);

export const IconCategory = (p: IconProps) => (
  <S {...p}>
    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
  </S>
);

export const IconTruck = (p: IconProps) => (
  <S {...p}>
    <path d="M5 17a2 2 0 1 0 4 0a2 2 0 0 0-4 0M15 17a2 2 0 1 0 4 0a2 2 0 0 0-4 0M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6M13 8h4l3 4v5h-2" />
  </S>
);

export const IconArrowDown = (p: IconProps) => (
  <S {...p}>
    <path d="M12 5v14M18 13l-6 6l-6-6" />
  </S>
);

export const IconArrowUp = (p: IconProps) => (
  <S {...p}>
    <path d="M12 19V5M6 11l6-6l6 6" />
  </S>
);

export const IconChart = (p: IconProps) => (
  <S {...p}>
    <path d="M3 13a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM10 5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1zM17 9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1z" />
  </S>
);

export const IconBell = (p: IconProps) => (
  <S {...p}>
    <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6M9 17v1a3 3 0 0 0 6 0v-1" />
  </S>
);

export const IconHistory = (p: IconProps) => (
  <S {...p}>
    <path d="M12 8v4l3 3M3.05 11a9 9 0 1 1 .5 4M3 4v5h5" />
  </S>
);

export const IconFile = (p: IconProps) => (
  <S {...p}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2M9 9h1M9 13h6M9 17h6" />
  </S>
);

export const IconMenu = (p: IconProps) => (
  <S {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </S>
);

export const IconSearch = (p: IconProps) => (
  <S {...p}>
    <path d="M10 17a7 7 0 1 0 0-14a7 7 0 0 0 0 14M21 21l-6-6" />
  </S>
);

export const IconPlus = (p: IconProps) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const IconAlertTriangle = (p: IconProps) => (
  <S {...p}>
    <path d="M12 9v4M10.36 4.2L2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.64 4.2a2 2 0 0 0-3.28 0M12 17h.01" />
  </S>
);

export const IconMoney = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3v18M8 7h5a3 3 0 0 1 0 6H8h8" />
  </S>
);

export const IconDownload = (p: IconProps) => (
  <S {...p}>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5l5-5M12 4v12" />
  </S>
);

export const IconEye = (p: IconProps) => (
  <S {...p}>
    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0M21 12c-2.4 4-5.4 6-9 6s-6.6-2-9-6c2.4-4 5.4-6 9-6s6.6 2 9 6" />
  </S>
);

export const IconSettings = (p: IconProps) => (
  <S {...p}>
    <path d="M10.3 4.3a2 2 0 0 1 3.4 0l.5.9a2 2 0 0 0 2 1l1-.1a2 2 0 0 1 1.7 3l-.5.9a2 2 0 0 0 0 2l.5.9a2 2 0 0 1-1.7 3l-1-.1a2 2 0 0 0-2 1l-.5.9a2 2 0 0 1-3.4 0l-.5-.9a2 2 0 0 0-2-1l-1 .1a2 2 0 0 1-1.7-3l.5-.9a2 2 0 0 0 0-2l-.5-.9a2 2 0 0 1 1.7-3l1 .1a2 2 0 0 0 2-1zM10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0" />
  </S>
);

export const IconChartLine = (p: IconProps) => (
  <S {...p}>
    <path d="M4 19h16M4 15l4-5l4 3l5-7" />
  </S>
);

export const IconAlertCircle = (p: IconProps) => (
  <S {...p}>
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0M12 8v4M12 16h.01" />
  </S>
);

export const IconEdit = (p: IconProps) => (
  <S {...p}>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17zM13.5 6.5l3 3" />
  </S>
);

export const IconTrash = (p: IconProps) => (
  <S {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </S>
);

export const IconX = (p: IconProps) => (
  <S {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </S>
);

export const IconPaper = (p: IconProps) => (
  <S {...p}>
    <path d="M5 2h10l4 4v16H5zM15 2v4h4M8 12h8M8 16h8" />
  </S>
);

export const IconUsb = (p: IconProps) => (
  <S {...p}>
    <path d="M4 9h10v7H4zM14 11.5h4a2 2 0 0 1 2 2V15M7 9V6M11 9V6" />
  </S>
);

export const IconInk = (p: IconProps) => (
  <S {...p}>
    <path d="M12 2L8 9v9a4 4 0 0 0 8 0V9zM8.5 12.5h7" />
  </S>
);

export const IconPen = (p: IconProps) => (
  <S {...p}>
    <path d="M5 19L19 5M14 4l6 6l-2 2l-6-6z" />
  </S>
);

export const IconBox = (p: IconProps) => (
  <S {...p}>
    <path d="M4 7l8-4l8 4l-8 4zM4 7v10l8 4 8-4V7M12 11v10" />
  </S>
);

export const PRODUCT_ICON_MAP: Record<
  ProductIcon,
  (p: IconProps) => React.ReactElement
> = {
  paper: IconPaper,
  ink: IconInk,
  usb: IconUsb,
  pen: IconPen,
  box: IconBox,
};
