import React, { useState } from 'react';
import BackgroundButton from '../BackgroundButton/BackgroundButton';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

const options = {
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 800;

const PageView = () => {
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState();
    const [containerRef, setContainerRef] = useState(null);
    const [containerWidth, setContainerWidth] = useState();
    const [pdfFile, setPdfFile] = useState(null);


    const onResize =  ((entries) => {
        const [entry] = entries;

        if (entry) {
            setContainerWidth(entry.contentRect.width);
        }
    }, []);


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
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        setPdfFile(file);
    };

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }
    return (
        <div className='mt-8 mx-8'>
            <div className="flex justify-around items-center">
                <div className='flex justify-start gap-8'>
                    <BackgroundButton Text={"Add Page"} onClick={handleAddPage} />
                    <BackgroundButton Text={"+ Add area"} onClick={handleAddPage} />
                </div>
                <BackgroundButton Text={"Delete"} onClick={handleAddPage} />
            </div>
            <div className="mt-4">
                <div className="mt-4">
                    <div className='mt-8 mx-8'>
                        <div className="Example__container__document" ref={setContainerRef}>
                            <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
                                {Array.from(new Array(numPages), (el, index) => (
                                    <Page
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
                                    />
                                ))}
                            </Document>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PageView;
