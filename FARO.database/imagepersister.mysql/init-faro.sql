-- faro.Images definition

CREATE TABLE `Images` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `ImageKey` varchar(100) NOT NULL,
  `ImageArgs` text DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- faro.Layers definition

CREATE TABLE `Layers` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdImage` int(11) NOT NULL,
  `RowIdx` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Values` text DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Layers_FK` (`IdImage`),
  CONSTRAINT `Layers_FK` FOREIGN KEY (`IdImage`) REFERENCES `Images` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- faro.`Keys` definition

CREATE TABLE `Keys` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdImage` int(11) NOT NULL,
  `RowIdx` int(11) NOT NULL,
  `Values` text DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Keys_FK` (`IdImage`),
  CONSTRAINT `Keys_FK` FOREIGN KEY (`IdImage`) REFERENCES `Images` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- faro.`Rows` definition

CREATE TABLE `Rows` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdImage` int(11) NOT NULL,
  `RowIdx` int(11) NOT NULL,
  `Values` text DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Rows_FK` (`IdImage`),
  CONSTRAINT `Rows_FK` FOREIGN KEY (`IdImage`) REFERENCES `Images` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- faro.Aggregations definition

CREATE TABLE `Aggregations` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdImage` int(11) NOT NULL,
  `AggregatorKey` varchar(100) NOT NULL,
  `RowIdx` int(11) NOT NULL,
  `Values` text DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Aggregations_FK` (`IdImage`),
  CONSTRAINT `Aggregations_FK` FOREIGN KEY (`IdImage`) REFERENCES `Images` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;