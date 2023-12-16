import { Carousel } from "flowbite-react";
import { BsFacebook, BsInstagram, BsTiktok } from "react-icons/bs";
import img1 from "../assets/image-1.jpg";
import img2 from "../assets/image-2.jpg";
import img3 from "../assets/image-3.jpg";
import img4 from "../assets/image-4.jpg";
import img5 from "../assets/image-5.jpg";
import img6 from "../assets/image-6.jpg";
import img7 from "../assets/image-7.jpeg";
import Footer from "../components/Footer";
import bagexplore from "../assets/bagexplore.jpg";
import accessoriesexplore from "../assets/accessoriesexplore.png";
import accessoriesexploremobile from "../assets/accessoriesexploremobile.jpg";
import menexplore from "../assets/menexplore.jpg";
import menexploremobile from "../assets/menexploremobile.jpg";
import womenexplore from "../assets/womenexplore.jpg";
import womenexploremobile from "../assets/womenexploremobile.jpg";
import unisexexplore from "../assets/unisexexplore.jpg";
import unisexexploremobile from "../assets/unisexexploremobile.jpg";
import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import MenuListMobile from "../components/MenuListMobile";

export const Homepage = () => {
  useEffect(() => {
    // Scroll to the top when the component is first rendered
    window.scrollTo(0, 0);
  }, []);

  const imgListMobile = [img1, img2, img3];
  const imgListDesktop = [img4, img5, img6, img7];

  return (
    <div className="font-sagoe">
      <div className="flex px-4 lg:hidden ">
        <MenuListMobile />
      </div>
      <div className="h-screen w-full lg:hidden">
        <Carousel indicators={false} style={{ borderRadius: 0 }} className="enabled:rounded-none">
          {imgListMobile.map((img, index) => (
            <img key={index} src={img} alt={img} className="rounded-none" />
          ))}
        </Carousel>
      </div>
      <div className="hidden lg:block h-[95vh] w-full">
        <div className="h-[95vh] w-full">
          <Carousel indicators={false} style={{ borderRadius: 0 }} className="enabled:rounded-none">
            {imgListDesktop.map((img, index) => (
              <div key={index} style={{ backgroundImage: `url(${img})`, backgroundSize: "cover", height: "95vh" }} className="background-image"></div>
            ))}
          </Carousel>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="w-[50vw]">
          <img src={bagexplore} alt="bagexplore" className="w-full h-[450px] lg:h-[650px] object-cover" />
        </div>
        <div className="w-[50vw] flex items-center justify-center lg:p-0 p-6">
          <div className="flex flex-col space-y-4 lg:space-y-2">
            <span className="font-bold text-3xl font-sans">Waterproof Bags</span>
            <p className="font-sanz font-medium lg:text-lg">
              Explore waterproof bags from RAINS. The collection of bags <br />
              delivers a range of silhouettes developed for lifestyle needs.{" "}
            </p>
            <div>
              <Button className="w-36 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/unisex/bags"}>
                <span className="font-sans font-medium text-md">Explore</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="w-[50vw] flex items-center justify-center lg:p-0 p-6">
          <div className="flex flex-col space-y-4 lg:space-y-2">
            <span className="font-bold text-3xl font-sans">Accessories</span>
            <p className="font-sanz font-medium lg:text-lg ">
              Explore accessories from RAINS. Elevate your style simple <br />
              and easy to keep your outfits looking modern and timeless.
            </p>
            <div>
              <Button className="w-36 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/products/unisex/accessories"}>
                <span className="font-sans font-medium text-md">Explore</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="lg:block hidden w-[50vw]">
          <img src={accessoriesexplore} alt="accessoriesexplore" className="w-full h-[450px] lg:h-[650px] object-cover" />
        </div>
        <div className="block lg:hidden w-[50vw]">
          <img src={accessoriesexploremobile} alt="accessoriesexplore" className="w-full h-[450px] lg:h-[650px] object-cover" />
        </div>
      </div>
      <div className="flex justify-between">
        <div className="w-[50vw] hidden lg:flex items-end px-20 py-10" style={{ backgroundImage: `url(${menexplore})`, backgroundSize: "cover", height: "90vh" }}>
          <Button className="shadow-md shadow-gray-600 w-44 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/collections/men"}>
            <span className="font-sans font-medium text-md">Men Collections</span>
          </Button>
        </div>
        <div className="w-[50vw] hidden lg:flex items-end px-20 py-10" style={{ backgroundImage: `url(${womenexplore})`, backgroundSize: "cover", height: "90vh" }}>
          <Button className="shadow-md shadow-gray-600 w-44 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/collections/women"}>
            <span className="font-sans font-medium text-md">Women Collections</span>
          </Button>
        </div>
        {/* Mobile */}
        <div className="w-[50vw] lg:hidden flex items-end px-4 py-8" style={{ backgroundImage: `url(${menexploremobile})`, backgroundSize: "cover", height: "50vh" }}>
        <Button className=" shadow-md shadow-gray-600 w-44 p-2 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/collections/men"}>
          <span className="font-sans font-medium text-sm">Men Collections</span>
        </Button>
        </div>
        <div className="w-[50vw] lg:hidden flex items-end px-4 py-8" style={{ backgroundImage: `url(${womenexploremobile})`, backgroundSize: "cover", height: "50vh" }}>
        <Button className=" shadow-md shadow-gray-600 w-44 p-2 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/collections/women"}>
          <span className="font-sans font-medium text-sm">Women Collections</span>
        </Button>
        </div>
      </div>
      <div className="w-full hidden lg:flex items-end px-20 py-10" style={{ backgroundImage: `url(${unisexexplore})`, backgroundSize: "cover", height: "80vh" }}>
        <Button className=" shadow-md shadow-gray-600 w-44 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/collections/unisex"}>
          <span className="font-sans font-medium text-md">Unisex Collections</span>
        </Button>
      </div>
      {/* Mobile */}
      <div className="w-full lg:hidden flex items-end px-4 py-10" style={{ backgroundImage: `url(${unisexexploremobile})`, backgroundSize: "cover", height: "80vh" }}>
        <Button className=" shadow-md shadow-gray-600 w-44 p-2 border border-gray-600" bg="white" color="light" size="md" as={Link} to={"/collections/unisex"}>
          <span className="font-sans font-medium text-sm">Unisex Collections</span>
        </Button>
      </div>
      <Footer />
    </div>
  );
};
