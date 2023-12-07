import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Image,
  VStack,
  HStack,
  Box,
  useToast,
  Textarea,
} from '@chakra-ui/react';
import { FiCamera } from 'react-icons/fi';
import api from '../api'; 
import { useRef } from 'react';

const EditWarehouseModal = ({ isOpen, onClose, onSuccess, warehouseId }) => {
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [provinceId, setProvinceId] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);
  const [cityId, setCityId] = useState(0);
  const [selectedCity, setSelectedCity] = useState('');
  const [street, setStreet] = useState('');
  const [warehouseImage, setWarehouseImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl); // Set the image preview URL state
    }

    setWarehouseImage(file);
  };

  useEffect(() => {
    // Fetch provinces
    api.admin.get('/address/province').then(response => {
      if (response.data.ok) {
        setProvinces(response.data.detail);
      }
    });
  }, []);

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setProvinceId(provinceId); // Set the province id state
    setCityId(0); // Clear city id when province changes
    setCities([]); // Clear cities when province changes
    setSelectedCity(''); // Clear selected city when province changes

    // Fetch cities based on the selected province
    api.admin.get(`/address/city/${provinceId}`).then(response => {
      if (response.data.ok) {
        setCities(response.data.detail);
      }
    });

    // Set the province name
    const province = provinces.find((province) => province.province_id === provinceId);
    setProvince(province.province);

    // Set the city id
    const city = cities.find((city) => city.city_id === cityId);
    setCityId(city.city_id);
  };    

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('province', province);
    formData.append('provinceId', provinceId);
    formData.append('city', city);
    formData.append('cityId', cityId);
    formData.append('street', street);
    formData.append('warehouseImage', warehouseImage);

    try {
      const response = await api.admin.patch(`/api/warehouse/${warehouseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.ok) {
        toast({
          title: 'Success!',
          description: 'Warehouse has been updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose(); // Close the modal after successful submission
        onSuccess(); // Call the onSuccess prop to refetch the warehouses
        // Reset form
        setName('');
        setProvince('');
        setCity('');
        setStreet('');
        setImagePreview(null);
        setWarehouseImage(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error submitting the form.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'full', md: 'xl' }}>
      <ModalOverlay />
      <ModalContent mx={{ base: '4', md: '12' }} my="auto" rounded="lg" overflow="hidden">
        <ModalHeader className="font-bold text-lg text-center">Edit Warehouse</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="p-4">
          <VStack spacing="4">
            <Box className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center mx-auto" onClick={handlePhotoIconClick}>
              {imagePreview ? (
                <Image src={imagePreview} alt="Warehouse image" className="w-full h-full rounded" />
              ) : (
                <FiCamera className="h-12 w-12 text-gray-400" />
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </Box>
            <FormControl id="warehouse-name">
              <FormLabel>Warehouse Name</FormLabel>
              <Input placeholder="Enter warehouse name" onChange={(e) => setName(e.target.value)} value={name} />
            </FormControl>
            <VStack spacing="2" width="full" alignItems="flex-start">
              <FormLabel htmlFor="location" fontSize="1rem">Warehouse Location</FormLabel>
              <HStack spacing="2" width="full">
                <FormControl id="province" flex="1">
                  <Select placeholder='Select Province' onChange={handleProvinceChange} value={selectedProvince}>
                    {provinces.map((province) => (
                      <option key={province.province_id} value={province.province_id}>{province.province}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl id="city" flex="1">
                  <Select placeholder='Select City' onChange={(e) => setCity(e.target.value)} value={city} disabled={!selectedProvince}>
                    {cities.map((city) => (
                      <option key={city.city_id} value={city.city_name}>{city.city_name}</option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
            </VStack>
            <FormControl id="street">
              <Textarea placeholder="Enter street" onChange={(e) => setStreet(e.target.value)} value={street} />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter flexDirection={{ base: 'column', md: 'row' }} className="gap-2">
          <Button variant="outline" onClick={onClose} flex="1" className="border-gray-300 text-black">
            Discard
          </Button>
          <Button
            color="white"
            bg="black"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            flex="1"
            mt={{ base: '2', md: '1' }}
            _hover={{ bg: 'gray' }} // Add hover effect to change background color to gray
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditWarehouseModal;