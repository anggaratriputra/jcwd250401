import { Button } from "flowbite-react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useEffect } from "react";

function UnisexCollections() {
  useEffect(() => {
    // Scroll to the top when the component is first rendered
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="hidden lg:block w-full">
        <div className="flex items-end justify-end px-10 py-36 parallax unisexbags">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-40 p-4">
              Explore RAINS Bags, where functionality meets style. Our collection features a range of waterproof bags designed to keep your belongings dry in any weather. From sleek backpacks to versatile totes, each bag is crafted with
              precision and attention to detail. Discover the perfect combination of fashion and practicality as you navigate your daily adventures.
            </p>
          </div>
          <div className="w-[50vw] flex justify-end">
            <Button className=" w-56 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/unisex/bags"}>
              <span className="font-sans font-medium text-md">Explore Bags</span>
            </Button>
          </div>
        </div>
        <div className="flex items-end justify-end px-10 py-36 parallax unisexaccessories">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-40 p-4">
              Discover RAINS Accessories, where style and functionality come together seamlessly. From waterproof hats to sleek umbrellas, our collection is designed to enhance your everyday look while providing practical solutions for
              unpredictable weather. Elevate your accessories game with RAINS, where contemporary design meets weather-ready durability. Explore the collection for a stylish and functional addition to your wardrobe.
            </p>
          </div>
          <div className="w-[50vw] flex justify-end">
            <Button className=" w-56 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/unisex/accessories"}>
              <span className="font-sans font-medium text-md">Explore Bags</span>
            </Button>
          </div>
        </div>
        <div>
          <Footer />
        </div>
      </div>

      {/* Mobile */}
      <div className="block lg:hidden w-full">
        <div className="flex flex-col justify-end items-end px-10 py-36 parallax unisexbags">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-40 p-4">
            Explore RAINS Bags, where functionality meets style. Our collection features a range of waterproof bags designed to keep your belongings dry in any weather. From sleek backpacks to versatile totes, each bag is crafted with
              precision and attention to detail. Discover the perfect combination of fashion and practicality as you navigate your daily adventures.
            </p>
          </div>
          <div className="mt-4 w-[60vw] ">
            <Button className="w-64 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/unisex/bags"}>
              <span className="font-sans font-medium text-md">Explore Bags</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-end items-end px-10 py-20 parallax unisexaccessories">
          <div className="w-[60vw] text-white text-lg font-light">
            <p className="bg-black bg-opacity-40 p-4">
            Discover RAINS Accessories, where style and functionality come together seamlessly. From waterproof hats to sleek umbrellas, our collection is designed to enhance your everyday look while providing practical solutions for
              unpredictable weather.
            </p>
          </div>
          <div className="mt-4 w-[60vw]">
            <Button className="w-64 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/unisex/accessories"}>
              <span className="font-sans font-medium text-md">Explore Accessories</span>
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

export default UnisexCollections;
