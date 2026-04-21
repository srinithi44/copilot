import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import './FlashcardStyle.css';

const FlashcardViewer = ({ cards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const nextCard = (e) => {
        e.stopPropagation();
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
        }
    };

    const prevCard = (e) => {
        e.stopPropagation();
        if (currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(currentIndex - 1), 300);
        }
    };

    if (!cards || cards.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div
                className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
                onClick={handleFlip}
            >
                <div className="flashcard-inner">
                    <div className="flashcard-front">
                        <p>{cards[currentIndex].front}</p>
                    </div>
                    <div className="flashcard-back">
                        <p>{cards[currentIndex].back}</p>
                    </div>
                </div>
            </div>

            <div className="card-counter">
                {currentIndex + 1} / {cards.length}
            </div>

            <div className="flashcard-controls">
                <button
                    className="control-btn"
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                >
                    <ArrowLeft size={18} /> Prev
                </button>
                <button
                    className="control-btn"
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
                >
                    <RotateCw size={18} /> Flip
                </button>
                <button
                    className="control-btn"
                    onClick={nextCard}
                    disabled={currentIndex === cards.length - 1}
                >
                    Next <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default FlashcardViewer;
