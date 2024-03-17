import React, { useEffect, useState } from 'react';
import BackgroundButton from '../BackgroundButton/BackgroundButton';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { MdOutlineArrowCircleLeft, MdOutlineArrowCircleRight } from "react-icons/md";
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';



pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

const options = {
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 1200;
const pagesPerRow = 6;

const PageView = () => {
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState();
    const [containerRef, setContainerRef] = useState(null);
    const [containerWidth, setContainerWidth] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [largePage, setLargePage] = useState(null);
    const [singlePageView, setSinglePageView] = useState(false);
    const [isAddingArea, setIsAddingArea] = useState(false);
    const [rectangles, setRectangles] = useState([]);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
    const [selectedRectangle, setSelectedRectangle] = useState(null);


    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            const [entry] = entries;

            if (entry) {
                setContainerWidth(entry.contentRect.width);
            }
        });

        if (containerRef) {
            observer.observe(containerRef);
        }

        return () => observer.disconnect();
    }, [containerRef]);


    function onFileChange(event) {
        const { files } = event.target;

        if (files && files[0]) {
            setFile(files[0] || null);
        }
    }

    function onDocumentLoadSuccess({ numPages: nextNumPages }) {
        setNumPages(nextNumPages);
    }

    const handleAddPage = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf';
        fileInput.onchange = handleFileChange;
        fileInput.click();
    };

    const handleAddArea = () => {
        setIsAddingArea(true);
        // Additional code to handle adding areas to the selected page
    };

    const handleMouseDown = (e) => {
        if (isAddingArea) {
            setStartPosition({ x: e.clientX, y: e.clientY });
            setEndPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e) => {
        if (isAddingArea) {
            setEndPosition({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        const newRectangle = {
            x: Math.min(startPosition.x, endPosition.x),
            y: Math.min(startPosition.y, endPosition.y),
            width: Math.abs(endPosition.x - startPosition.x),
            height: Math.abs(endPosition.y - startPosition.y),
        };
        setRectangles([...rectangles, newRectangle]);
        setSelectedRectangle(newRectangle);
        setStartPosition({ x: 0, y: 0 });
        setEndPosition({ x: 0, y: 0 });

        // Generate and download the PDF
        // generatePDF();

        // Generate and download the image
        // generateImage(1,newRectangle);
    };

    const handleGenerateImage = () => {
        // Additional code to handle generating an image from the selected area
        if (selectedRectangle) {
            generateImage(1, selectedRectangle);
            // generatePDF(1, selectedRectangle);
            generateTxtFileFromObject(selectedRectangle);
        }
    };

    const generatePDF = (pageNumber, rectangle) => {
        if (pageNumber && rectangle) {
            // Get the page container element
            const pageContainer = document.querySelector('.react-pdf__Page__textContent');

            // Check if the page container exists
            if (pageContainer) {
                // Convert HTML content to an image using html2canvas
                html2canvas(pageContainer).then(canvas => {
                    // Create a new jsPDF instance
                    const doc = new jsPDF();

                    // Add the image of the page content to the PDF
                    doc.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 10, 10, 190, 277);

                    // Save the PDF
                    doc.save(`page_${pageNumber}_coming_soon.pdf`);
                });
            } else {
                console.error('Page container not found.');
            }
        } else {
            console.error('Invalid page number or rectangle.');
        }
    };

    const generateTxtFileFromObject = (newRectangle) => {
        // Convert the object to a string
        const textData = JSON.stringify(newRectangle, null, 2);
    
        // Create a Blob object with the TXT content
        const blob = new Blob([textData], { type: 'text/plain' });
    
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'file.txt';
    
        // Append the download link to the document body
        document.body.appendChild(downloadLink);
    
        // Trigger the download
        downloadLink.click();
    
        // Clean up by removing the download link
        document.body.removeChild(downloadLink);
    };

    
    const generateImage = (pageNumber, rectangle) => {
        if (pageNumber && rectangle) {
            const pageCanvas = document.querySelector('.react-pdf__Page__canvas');
            console.log('Page Canvas:', pageCanvas);
            if (pageCanvas) {
                // const imageData = pageCanvas.toDataURL('image/png');
                // const img = new Image();
                // img.src = imageData;
                // document.body.appendChild(img);


                const canvasContext = pageCanvas.getContext('2d');

                // Define the region to capture based on the rectangle coordinates
                const { x, y, width, height } = rectangle;
                console.log('Rectangle:', rectangle);

                // Create a new canvas to hold the cropped region
                const croppedCanvas = document.createElement('canvas');
                const croppedContext = croppedCanvas.getContext('2d');

                // Set the size of the new canvas to match the cropped region
                croppedCanvas.width = width;
                croppedCanvas.height = height;

                // Draw the cropped region on the new canvas
                croppedContext.drawImage(pageCanvas, 0, 0, width, height, 0, 0, width, height);

                // Generate the image data URL for the cropped region
                const imageData = croppedCanvas.toDataURL('image/png');
                // Create a link element for downloading the image
                const downloadLink = document.createElement('a');
                downloadLink.href = imageData;
                downloadLink.download = `page_${pageNumber}_image.png`;

                // Append the download link to the document body
                document.body.appendChild(downloadLink);

                // Trigger the download
                downloadLink.click();

                // Remove the download link from the document
                document.body.removeChild(downloadLink);
            } else {
                console.error('Page canvas not found.');
            }
        } else {
            console.error('Invalid page number or rectangle.');
        }
    };



    // const renderRectangles = () => {
    //     return rectangles.map((rect, index) => (
    //         <div
    //             key={`rect_${index}`}
    //             className="rectangle"
    //             style={{
    //                 position: 'absolute',
    //                 border: '2px solid red', // Adjust border properties as needed
    //                 left: `${rect.x}px`,
    //                 top: `${rect.y}px`,
    //                 width: `${rect.width}px`,
    //                 height: `${rect.height}px`,
    //             }}
    //             onMouseUp={handleMouseUp} // Call handleMouseUp when rectangle drawing is complete
    //         />
    //     ));
    // };
    const containerStyle = {
        cursor: isAddingArea ? 'crosshair' : 'auto',
        // position: 'relative',
    };

    const handleDeletePage = () => {
        // Code to delete the selected page
        setFile(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
    };

    const handlePreviousPage = () => {
        setCurrentPage(Math.max(currentPage - pagesPerRow, 1));
        setRectangles([]);
    };

    const handleNextPage = () => {
        setCurrentPage(Math.min(currentPage + pagesPerRow, numPages));
        setRectangles([]);
    };

    const handleDoubleClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        setSinglePageView(true);
        setRectangles([]);
    };
    const renderPages = () => {
        if (!numPages) return null;

        const pageCount = Math.ceil(numPages / pagesPerRow);
        const startIndex = (currentPage - 1) * pagesPerRow;
        const endIndex = Math.min(startIndex + pagesPerRow, numPages);


        if (singlePageView) {
            return (
                <div className="page-container" onDoubleClick={() => setSinglePageView(false)} style={containerStyle} onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseDown={handleMouseDown}
                >
                    <Page
                        pageNumber={currentPage}
                        width={containerWidth ? Math.min(containerWidth * 0.6, maxWidth) : maxWidth}
                        height={containerWidth ? Math.min(containerWidth * 0.6 * 1.414, maxWidth * 0.4) : maxWidth * 1.414}
                    />
                    {renderRectangles()}
                </div>
            );
        } else {
            return Array.from({ length: endIndex - startIndex }, (_, index) => {
                const pageNumber = startIndex + index + 1;

                return (
                    <div
                        key={`page_${pageNumber}`}
                        className="page-container"
                        onDoubleClick={() => handleDoubleClick(index + 1)}
                    >
                        <Page
                            pageNumber={pageNumber}
                            width={containerWidth ? Math.min(containerWidth / pagesPerRow, maxWidth / pagesPerRow) : maxWidth / pagesPerRow}
                        />
                    </div>
                );
            });
        }
    };

    // CSS styles for rectangles
    const rectangleStyle = {
        position: 'absolute',
        border: '2px solid blue', // Adjust border properties as needed
    };
    const renderRectangles = () => {
        return rectangles.map((rect, index) => (
            <div
                key={`rect_${index}`}
                className="rectangle"
                style={{
                    position: 'absolute',
                    border: '2px solid blue', // Adjust border properties as needed
                    left: `${rect.x}px`,
                    top: `${rect.y}px`,
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                }}
            />
        ));
    };

    return (
        <div className='mt-8 mx-8'>
            <div className="flex justify-around items-center">
                <div className='flex justify-start gap-8'>
                    <BackgroundButton Text={"Add Page"} onClick={handleAddPage} />
                    <BackgroundButton Text={"+ Add area"} onClick={handleAddArea} />
                    <BackgroundButton Text={"Generate image"} onClick={handleGenerateImage} />
                </div>
                <BackgroundButton Text={"Delete"} onClick={handleDeletePage} />
            </div>
            <div className="mt-20 mx-12">
                <div className="mt-4">
                    <div className='mt-8 mx-8'>
                        <div className="Example__container__document" ref={setContainerRef}>
                            <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options} className="flex flex-wrap mx-auto justify-center">
                                {renderPages()}
                            </Document>
                        </div>
                        {file && (
                            <div className="mt-4 flex justify-center gap-10">
                                <MdOutlineArrowCircleLeft
                                    className={`cursor-pointer ${currentPage === 1 ? 'opacity-50' : ''}`}
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    size={50}
                                />
                                <MdOutlineArrowCircleRight
                                    className={`cursor-pointer ${currentPage === numPages ? 'opacity-50' : ''}`}
                                    onClick={handleNextPage}
                                    disabled={currentPage === numPages}
                                    size={50}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PageView;
