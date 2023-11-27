import { useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatSegment = (segment) => {
  const words = segment.split("-");
  const capitalizedWords = words.map((word) => capitalize(word));
  return capitalizedWords.join(" ");
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter((segment) => segment !== "");

  // Check if the URL contains "products", and if so, skip the first segment
  const skipProducts = pathSegments[0] === "products";
  const segmentsToRender = skipProducts ? pathSegments.slice(1) : pathSegments;

  return (
    <Breadcrumb>
      <BreadcrumbItem >
        <BreadcrumbLink>
          <Link to={"/"} className="hover:underline">
            Home
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      {segmentsToRender.map((segment, index, array) => (
        <BreadcrumbItem key={index} isCurrentPage={index === array.length - 1}>
          {index === 0 || index === array.length - 1 ? (
            <span>{formatSegment(segment)}</span>
          ) : (
            <BreadcrumbLink>
              <Link className="hover:underline" to={`/products/${array.slice(0, index + 1).join("/")}`}>
                {formatSegment(segment)}
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
