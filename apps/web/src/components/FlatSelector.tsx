import vars from "@/index.module.scss";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./FlatSelector.module.scss";

export interface FlatSelectorProps {
    options: string[];
    onSelect?: (option: string, index?: number) => void;
}

function FlatSelector(props: FlatSelectorProps) {
    const [selectIndicatorPos, setSelectIndicatorPos] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const { options, onSelect } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const activeElement = containerRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;

        if (activeElement) {
            const rect = activeElement.getBoundingClientRect();

            setSelectIndicatorPos({
                x: rect.left - 4,
                y: rect.top - 4,
                width: rect.width + 8,
                height: rect.height + 8,
            });
        }
    }, [selectedIndex, options]);

    function handleOptionClick(option: string, index: number) {
        setSelectedIndex(index);
        onSelect?.(option, index);
    }

    return (
        <div ref={containerRef} className={styles.container}>
            {options.map((option, index) => (
                <motion.p
                    animate={{ color: index === selectedIndex ? vars.primaryColor : vars.secondaryColor }}
                    className={styles.option}
                    key={index}
                    onClick={() => handleOptionClick(option, index)}
                    data-index={index}
                >
                    {option}
                </motion.p>
            ))}
            <motion.div
                style={{
                    left: `${selectIndicatorPos.x}px`,
                    width: `${selectIndicatorPos.width}px`,
                    top: `${selectIndicatorPos.y}px`,
                    height: `${selectIndicatorPos.height}px`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                layout
                className={styles.selectIndicator}
            />
        </div>
    );
}

export default FlatSelector;
