import { Footer, FooterCopyright } from "flowbite-react";

export default function FooterNav() {
  return (
    <div className="w-full">
      <Footer
        container
        className="rounded-none !bg-gray-100 border-t !border-gray-200 shadow-none py-4"
      >
        <div className="w-full text-center md:text-left">
          <FooterCopyright
            href="#"
            by="CV Mitra Jalan™"
            year={2026}
            className="text-gray-500 font-medium"
          />
        </div>
      </Footer>
    </div>
  );
}
