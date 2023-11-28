const axios = require("axios");
const { Warehouse, WarehouseAddress, Admin } = require("../models"); // Adjust the path as necessary4

exports.getAllWarehouses = async (req, res) => {
  try {
    const { adminId } = req.query;

    let whereClause = {};

    if (adminId) {
      whereClause = { adminId };
    }
    const warehouses = await Warehouse.findAll({
      where: whereClause,
      include: [
        {
          model: WarehouseAddress,
          attributes: ["street", "city", "province", "longitude", "latitude"],
        },
      ],
    });

    if (warehouses.length === 0) {
      return res.status(404).send({
        message: "Warehouses not found",
      });
    }

    res.json({
      ok: true,
      data: warehouses,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving warehouses: " + error.message,
    });
  }
};

// Function to convert address to coordinates
const convertAddressToCoordinates = async (address) => {
  try {
    const response = await axios.get(`https://geocode.maps.co/search?q=${encodeURIComponent(address)}`);
    // Check if the response data array has at least one result
    if (response.data && response.data.length > 0) {
      const firstResult = response.data[0];
      return { lat: firstResult.lat, lon: firstResult.lon };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error converting address to coordinates:", error);
    return null;
  }
};

exports.addWarehouse = async (req, res) => {
  const { name, street, city, province } = req.body;
  const address = `${street}, ${city}, ${province}`;

  try {
    // Convert address to coordinates
    const coordinates = await convertAddressToCoordinates(address);

    if (!coordinates) {
      return res.status(400).send("Invalid address or unable to find coordinates.");
    }

    // Retrieve the uploaded image file, if available
    let warehouseImage;
    if (req.file) {
      warehouseImage = req.file.filename; // The filename where the image is stored
    } else {
      // Handle the case where no image is uploaded (optional)
      warehouseImage = "default-image-path"; // Or leave it undefined, based on your application logic
    }

    // Create Warehouse with location and coordinates
    const warehouse = await Warehouse.create({
      name,
      location: address,
      warehouseImage,
    });

    // Create WarehouseAddress
    const warehouseAddress = await WarehouseAddress.create({
      warehouseId: warehouse.id,
      street,
      city,
      province,
      latitude: coordinates.lat,
      longitude: coordinates.lon,
    });

    // Update Warehouse with warehouseAddressId
    await Warehouse.update(
      {
        warehouseAddressId: warehouseAddress.id,
      },
      {
        where: {
          id: warehouse.id,
        },
      }
    );

    // If coordinates not found, return error
    if (warehouseAddress.latitude === null || warehouseAddress.longitude === null) {
      return res.status(400).send("Invalid address or unable to find coordinates.");
    }

    res.json({
      ok: true,
      data: {
        name: warehouse.name,
        location: warehouse.location,
        coordinates: {
          latitude: warehouseAddress.latitude,
          longitude: warehouseAddress.longitude,
        },
        warehouseImage,
      },
    });
  } catch (error) {
    res.status(500).send({
      message: "Error adding warehouse: " + error.message,
    });
  }
};

exports.updateWarehouse = async (req, res) => {
  const { id } = req.params;
  const { name, street, city, province } = req.body;
  const address = `${street}, ${city}, ${province}`;

  try {
    // Convert address to coordinates
    const coordinates = await convertAddressToCoordinates(address);

    if (!coordinates) {
      return res.status(400).send("Invalid address or unable to find coordinates.");
    }

    // Check if there is a new file uploaded
    let warehouseImage;
    if (req.file) {
      warehouseImage = req.file.filename; // Path to the new uploaded file
    }

    // Update Warehouse with new data
    const warehouseUpdate = {
      name,
      location: address,
    };

    // If a new image is uploaded, include it in the update
    if (warehouseImage) {
      warehouseUpdate.warehouseImage = warehouseImage;
    }

    const warehouse = await Warehouse.update(warehouseUpdate, {
      where: { id },
    });

    // Update WarehouseAddress
    const warehouseAddress = await WarehouseAddress.update(
      {
        street,
        city,
        province,
        latitude: coordinates.lat,
        longitude: coordinates.lon,
      },
      {
        where: {
          id, // Assuming this is the correct field to match
        },
      }
    );

    // If coordinates not found, return error
    if (!coordinates.lat || !coordinates.lon) {
      return res.status(400).send("Invalid address or unable to find coordinates.");
    }

    res.json({
      ok: true,
      data: {
        name,
        location: address,
        coordinates,
        warehouseImage: warehouseImage || "Existing image path or default", // You can modify this as needed
      },
    });
  } catch (error) {
    res.status(500).send({
      message: "Error updating warehouse: " + error.message,
    });
  }
};

exports.deleteWarehouse = async (req, res) => {
  const { id } = req.params;

  try {
    const warehouse = await Warehouse.destroy({
      where: {
        id,
      },
    });

    const warehouseAddress = await WarehouseAddress.destroy({
      where: {
        id,
      },
    });

    if (warehouse === 0 || warehouseAddress === 0) {
      return res.status(404).send({
        message: "Warehouse not found",
      });
    }

    res.json({
      ok: true,
      message: "Warehouse deleted",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error deleting warehouse: " + error.message,
    });
  }
};

exports.assignWarehouseAdmin = async (req, res) => {
  const { warehouseId } = req.params;
  const { adminId } = req.body;

  try {
    const warehouse = await Warehouse.findByPk(warehouseId);
    const adminAcc = await Admin.findByPk(adminId);

    if (!warehouse) {
      return res.status(404).json({
        ok: false,
        message: "Warehouse not found",
      });
    }

    if (!adminAcc || adminAcc.isWarehouseAdmin !== true) {
      return res.status(404).json({
        ok: false,
        message: "Admin not found or not a warehouse admin",
      });
    }

    if (warehouse.adminId) {
      return res.status(400).json({
        ok: false,
        message: "Warehouse already has an assigned admin",
      });
    }

    warehouse.adminId = adminId;

    await warehouse.save();

    return res.status(200).json({
      ok: true,
      message: "Warehouse admin assigned successfully",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error assigning warehouse admin",
      detail: String(error),
    });
  }
};

exports.unassignWarehouseAdmin = async (req, res) => {
  const { warehouseId } = req.params;

  try {
    const warehouse = await Warehouse.findByPk(warehouseId);

    if (!warehouse) {
      return res.status(404).json({
        ok: false,
        message: "Warehouse not found",
      });
    }

    if (!warehouse.adminId) {
      return res.status(400).json({
        ok: false,
        message: "Warehouse does not have an assigned admin",
      });
    }

    warehouse.adminId = null;

    await warehouse.save();

    return res.status(200).json({
      ok: true,
      message: "Warehouse admin unassigned successfully",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error unassigning warehouse admin",
      detail: String(error),
    });
  }
};

exports.getWarehouseByAdmin = async (req, res) => {
  const { adminId } = req.params;

  try {
    const warehouse = await Warehouse.findOne({
      where: {
        adminId,
      },
    })

    if (!warehouse) {
      return res.status(404).json({
        ok: false,
        message: "Warehouse not found",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Get warehouse successfully",
      detail: warehouse,
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
      detail: String(error),
    });
  }
}
