import { Link } from "react-router-dom";
import { PiGlobe } from "react-icons/pi";

function Footer() {
  return (
    <div className="w-full flex flex-col bg-[#F0F0F0] text-gray-800">
      <div className="w-full px-32 py-10  flex space-x-36">
        <div className="flex flex-1 flex-col space-y-3">
          <span className="font-bold font-sanstext-md"> Service </span>
          <Link>
            <span className="font-thin font-sans text-sm">Help Center</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">Contact</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">Shipping</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">Return</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">Warranty</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col space-y-3">
          <span className="font-bold font-sans text-md">Company</span>
          <Link>
            <span className="font-thin font-sans text-sm">About</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">Career</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">Press</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">Image bank</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col space-y-3">
          <span className="font-bold font-sans text-md">Social</span>
          <Link>
            <span className="font-thin font-sans text-sm">Instagram</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">Facebook</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">Pinterest</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">TikTok</span>
          </Link>
          <Link>
            <span className="font-thin font-sans text-sm">LinkedIn</span>
          </Link>
        </div>
        <div className="flex flex-col space-y-3">
          <span className="font-bold font-sans text-md">Shipping to</span>
          <Link>
            <div className="flex space-x-2 items-center">
              <PiGlobe size="24px" />
              <span className="font-thin font-sans text-sm"> Rest of the world</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 flex-col space-y-3">
          <span className="font-bold font-sans text-md">E-Newsletter</span>
          <p className="font-thin font-sans text-sm">Sign up and be the first-in-the know about new arrivals, promotions, in-store events and more.</p>
          <Link>
            <span className="font-bold font-sans text-sm">Subscribe now</span>
          </Link>
        </div>
      </div>
      <div className="w-full flex px-32 space-x-12 items-center py-4 border-1 border-t border-gray-300">
        <span className="font-medium font-sans text-sm">© Rains 2023, All rights reserved.</span>
        <Link>
          <span className="font-light font-sans text-sm">Terms & conditions</span>
        </Link>
        <Link>
          <span className="font-light font-sans text-sm">Privacy Policy</span>
        </Link>
        <Link>
            <span className="font-light font-sans text-sm">Cookie Policy</span>
          </Link>
      </div>
    </div>
  );
}

export default Footer;
