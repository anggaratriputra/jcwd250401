import { Button } from "flowbite-react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useEffect } from "react";

function WomenCollections() {
  useEffect(() => {
    // Scroll to the top when the component is first rendered
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <div className="hidden lg:block w-full">
        <div className="flex justify-between items-end px-10 py-36 parallax womenjackets">
          <div className="w-[50vw] ">
            <Button className=" w-56 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/women/jackets"}>
              <span className="font-sans font-medium text-md">Explore Women's Jackets</span>
            </Button>
          </div>
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-20 p-4">
              Discover RAINS Women's Jackets, stylish and practical. From urban to outdoor, our jackets are made for versatility. Stay chic and protected in any weather. Explore now for a fashionable and functional wardrobe upgrade.
            </p>
          </div>
        </div>
        <div className="flex justify-between items-end px-10 py-36 parallax womentops">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-25 p-4">
              Explore RAINS Women's Tops, a blend of style and comfort. From everyday tees to versatile shirts, our collection is crafted for simplicity and quality. Elevate your wardrobe effortlessly with RAINS.
            </p>
          </div>
          <div className="w-[50vw] flex justify-end">
            <Button className=" w-56 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/women/tops"}>
              <span className="font-sans font-medium text-md">Explore Women's Tops</span>
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-end px-10 py-36 parallax womenbottom">
          <div className="w-[50vw] ">
            <Button className=" w-56 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/women/bottoms"}>
              <span className="font-sans font-medium text-md">Explore Women's Bottoms</span>
            </Button>
          </div>
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-25 p-4">
              Discover RAINS Women's Bottoms, where style meets waterproof protection. Whether it's relaxed shorts or chic pants, our collection is crafted for versatile fashion that keeps you dry in any weather. Elevate your everyday look
              with the functional elegance of RAINS.
            </p>
          </div>
        </div>
        <div>
          <Footer />
        </div>
      </div>
      {/* Mobile */}
      <div className="block lg:hidden w-full">
        <div className="flex flex-col justify-end items-end px-10 py-36 parallax womenjackets">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-20 p-4">
              Discover RAINS Women's Jackets, stylish and practical. From urban to outdoor, our jackets are made for versatility. Stay chic and protected in any weather. Explore now for a fashionable and functional wardrobe upgrade.
            </p>
          </div>
          <div className="mt-4 w-[60vw] ">
            <Button className="w-64 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/women/jackets"}>
              <span className="font-sans font-medium text-md">Explore Women's Jackets</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-end items-end px-10 py-20 parallax womentops">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-25 p-4">
              Explore RAINS Women's Tops, a blend of style and comfort. From everyday tees to versatile shirts, our collection is crafted for simplicity and quality. Elevate your wardrobe effortlessly with RAINS.
            </p>
          </div>
          <div className="mt-4 w-[60vw]">
            <Button className="w-64 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/women/tops"}>
              <span className="font-sans font-medium text-md">Explore Women's Tops</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-end items-end px-10 py-20 parallax womenbottom">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-25 p-4">
              Discover RAINS Women's Bottoms, where style meets waterproof protection. Whether it's relaxed shorts or chic pants, our collection is crafted for versatile fashion that keeps you dry in any weather. Elevate your everyday look
              with the functional elegance of RAINS.
            </p>
          </div>
          <div className="mt-4 w-[60vw]">
            <Button className="w-64 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/women/bottoms"}>
              <span className="font-sans font-medium text-md">Explore Women's Bottoms</span>
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

export default WomenCollections;
