import React, { useEffect, useState } from 'react';
import BackgroundButton from '../BackgroundButton/BackgroundButton';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { MdOutlineArrowCircleLeft, MdOutlineArrowCircleRight } from "react-icons/md";

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
        // Code to add a new area to the selected page
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
    };

    const handleNextPage = () => {
        setCurrentPage(Math.min(currentPage + pagesPerRow, numPages));
    };

    // const renderPages = () => {
    //     if (!numPages) return null;

    //     const pageCount = Math.ceil(numPages / pagesPerRow);

    //     return Array.from({ length: pageCount }, (_, index) => {
    //         const startPage = (currentPage - 1) + (index * pagesPerRow) + 1;
    //         const endPage = Math.min(startPage + pagesPerRow - 1, numPages);

    //         return (
    //             <div key={`row_${index}`} className="flex flex-wrap h-64 overflow-y-auto">
    //                 {Array.from({ length: endPage - startPage + 1 }, (_, pageIndex) => (
    //                     <Page
    //                         key={`page_${startPage + pageIndex}`}
    //                         pageNumber={startPage + pageIndex}
    //                         width={containerWidth ? Math.min(containerWidth / pagesPerRow, maxWidth / pagesPerRow) : maxWidth / pagesPerRow}
    //                     />
    //                 ))}
    //             </div>
    //         );
    //     });
    // };
    const renderPages = () => {
        if (!numPages) return null;

        const pageCount = Math.ceil(numPages / pagesPerRow);
        const startIndex = (currentPage - 1) * pagesPerRow;
        const endIndex = Math.min(startIndex + pagesPerRow, numPages);

        return Array.from({ length: endIndex - startIndex }, (_, index) => {
            const pageNumber = startIndex + index + 1;

            return (
                <Page
                    key={`page_${pageNumber}`}
                    pageNumber={pageNumber}
                    width={containerWidth ? Math.min(containerWidth / pagesPerRow, maxWidth / pagesPerRow) : maxWidth / pagesPerRow}
                />
            );
        });
    };
    return (
        <div className='mt-8 mx-8'>
            <div className="flex justify-around items-center">
                <div className='flex justify-start gap-8'>
                    <BackgroundButton Text={"Add Page"} onClick={handleAddPage} />
                    <BackgroundButton Text={"+ Add area"} onClick={handleAddArea} />
                </div>
                <BackgroundButton Text={"Delete"} onClick={handleDeletePage} />
            </div>
            <div className="mt-8 mx-12">
                <div className="mt-4">
                    <div className='mt-8 mx-8'>
                        <div className="Example__container__document" ref={setContainerRef}>
                            <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options} className="flex flex-wrap mx-auto justify-center">
                                {renderPages()}
                            </Document>
                        </div>
                        <div className="mt-4 flex gap-10 items-center justify-center ">
                            <MdOutlineArrowCircleLeft className='cursor-pointer' onClick={handlePreviousPage} />
                            <MdOutlineArrowCircleRight className='cursor-pointer' onClick={handleNextPage} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PageView;
