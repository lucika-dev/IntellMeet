import { Header } from "@wraith/ui/shared/Header";
import { Logo } from "@wraith/ui/shared/Logo";

export default function AppHeader() {
  return (
    <Header
      variant="elevated"
      size="default"
      container="default"
      logo={
        <Logo
          src="/svg/Logo.svg"
          alt="IntellMeet"
          href="/"
          size={52}
          priority
        />
      }
      navigation={[
        {
          label: "Home",
          href: "/",
        },
        {
          label: "Pricing",
          href: "/pricing",
        },
        {
          label: "Docs",
          href: "/docs",
        },
      ]}
    />
  );
}