import { Button } from "flowbite-react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useEffect } from "react";

function MenCollections() {
  useEffect(() => {
    // Scroll to the top when the component is first rendered
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <div className="lg:block hidden w-full">
        <div className="flex justify-between items-end px-10 py-36 parallax menjackets">
          <div className="w-[50vw] ">
            <Button className=" w-56 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/men/jackets"}>
              <span className="font-sans font-medium text-md">Explore Men's Jackets</span>
            </Button>
          </div>
          <div className="w-[60vw] text-white text-xl font-light">
            <p className="bg-black bg-opacity-20 p-4">
              Discover a range of men's jackets that perfectly balance style and practicality. RAINS Jackets are all about keeping you comfortable while looking good. With modern designs and top-notch materials, these jackets are not only
              fashion-forward but also weather-resistant.
            </p>
          </div>
        </div>
        <div className="flex justify-between items-end px-10 py-36 parallax mentops">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-25 p-4">
              Introducing RAINS Men's Tops: minimalist style, maximum functionality. From classic tees to versatile shirts, each piece is crafted with precision. Elevate your everyday look with RAINS.
            </p>
          </div>
          <div className="w-[50vw] flex justify-end">
            <Button className=" w-56 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/men/tops"}>
              <span className="font-sans font-medium text-md">Explore Men's Tops</span>
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-end px-10 py-36 parallax menbottom">
          <div className="w-[50vw] ">
            <Button className=" w-56 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/men/bottoms"}>
              <span className="font-sans font-medium text-md">Explore Men's Bottoms</span>
            </Button>
          </div>
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-25 p-4">Check out RAINS Men's Bottoms : stylish, versatile, and waterproof. From casual shorts to sleek pants, redefine your everyday style effortlessly with RAINS.</p>
          </div>
        </div>
        <div>
          <Footer />
        </div>
      </div>

      {/* Mobile */}
      <div className="block lg:hidden w-full">
        <div className="flex flex-col justify-end items-end px-10 py-36 parallax menjackets">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-20 p-4">
              Discover a range of men's jackets that perfectly balance style and practicality. RAINS Jackets are all about keeping you comfortable while looking good. With modern designs and top-notch materials, these jackets are not only
              fashion-forward but also weather-resistant.
            </p>
          </div>
          <div className="w-[60vw] ">
            <Button className="w-64 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/men/jackets"}>
              <span className="font-sans font-medium text-md">Explore Men's Jackets</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-end items-end px-10 py-20 parallax mentops">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-25 p-4">
              Introducing RAINS Men's Tops: minimalist style, maximum functionality. From classic tees to versatile shirts, each piece is crafted with precision. Elevate your everyday look with RAINS.
            </p>
          </div>
          <div className="w-[60vw]">
            <Button className="w-64 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/men/tops"}>
              <span className="font-sans font-medium text-md">Explore Men's Tops</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-end items-end px-10 py-20 parallax menbottom">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-25 p-4">Check out RAINS Men's Bottoms : stylish, versatile, and waterproof. From casual shorts to sleek pants, redefine your everyday style effortlessly with RAINS.</p>
          </div>
          <div className="w-[60vw]">
            <Button className="w-64 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/men/bottoms"}>
              <span className="font-sans font-medium text-md">Explore Men's Bottoms</span>
            </Button>
          </div>
        </div>
        <div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default MenCollections;
