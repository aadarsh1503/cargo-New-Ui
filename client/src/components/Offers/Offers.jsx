// src/components/Offers.jsx

import React, { useState, useEffect } from 'react';
import { getOffers } from '../../services/gvsApiService';
import * as XLSX from 'xlsx';
import './o.css'; 



function preprocessDataForMerging(data) {
  if (!data || data.length === 0) {
    return [];
  }


  const headerRow = data[0] || [];
  const podColumnIndex = headerRow.findIndex(
    header => header && header.toString().trim().toUpperCase() === 'POD'
  );


  const renderData = data.map(row =>
    row.map(cell => ({ value: cell, rowspan: 1, hidden: false }))
  );

  const numCols = renderData.length > 0 ? renderData[0].length : 0;
  if (numCols === 0) return [];


  for (let col = 0; col < numCols; col++) {
   
    if (col === podColumnIndex) {
      for (let row = 0; row < renderData.length; row++) {
        const cell = renderData[row][col];
        if (cell.hidden) continue;

        let span = 1;
        for (let k = row + 1; k < renderData.length; k++) {
          const nextCell = renderData[k][col];
          if (nextCell.value === null || nextCell.value === undefined) {
            span++;
            renderData[k][col].hidden = true;
          } else {
            break;
          }
        }
        cell.rowspan = span;
      }
    } 

    else {
      for (let row = 0; row < renderData.length; row++) {
        const cell = renderData[row][col];
     
        if (row > 0 && (cell.value === null || cell.value === undefined)) {
          cell.value = '-';
        }
      }
    }
  }

  return renderData;
}


const Offers = () => {
  const [parsedSheets, setParsedSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchAndParseAllOffers = async () => {
      try {
        const offerListResponse = await getOffers();
        if (!offerListResponse.data || offerListResponse.data.length === 0) {
          setError('No rate sheets have been uploaded yet.');
          setIsLoading(false);
          return;
        }

        const parsingPromises = offerListResponse.data.map(async (offer) => {
          const fileResponse = await fetch(offer.filePath);
          console.log("Fetching file from URL:", offer.filePath);
          if (!fileResponse.ok) throw new Error(`Failed to download ${offer.fileName}`);
          const arrayBuffer = await fileResponse.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
          
     
          const processedData = preprocessDataForMerging(rawData);
          
          return { id: offer.id, fileName: offer.fileName, data: processedData };
        });

        const allSheetData = await Promise.all(parsingPromises);
        setParsedSheets(allSheetData);
      } catch (err) {
        setError('An error occurred while loading the rates.');
        console.error("Processing Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndParseAllOffers();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <p className="loading-message">Loading rates, please wait...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }

    return parsedSheets.map(sheet => {
      if (!sheet.data || sheet.data.length === 0) return null;

      const headerRow = sheet.data[0];
      const dataRows = sheet.data.slice(1);

      return (
        <div key={sheet.id} className="sheet-wrapper">
          
          <div className="sheet-image-container">
            <img 
              src="https://res.cloudinary.com/dtjskgsnk/image/upload/v1751981405/cargo-ship-in-the-mi_fmqkrg.jpg" 
              alt="Cargo Shipment" 
            />
          </div>
          
          <div className="classic-table-container">
            <table className="classic-table">
              <thead>
                <tr>
                  {headerRow.map((cell, index) => <th key={index}>{cell.value}</th>)}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => {
                     
                      if (cell.hidden) return null; 
                      
                      return (
                        <td key={cellIndex} rowSpan={cell.rowspan > 1 ? cell.rowspan : undefined}>
                          {cell.value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      );
    });
  };

  return (
    <div className="offers-page-container">
      <h1 className="page-heading">GVS Cargo Offers Sheets</h1>
      {renderContent()}
    </div>
  );
};

export default Offers;