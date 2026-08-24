import RichText from "@/components/RichText";
import Colors from "@/constants/Colors";
import type { TableBlock } from "@/services/articleParser";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type TableViewProps = {
    block: TableBlock;
    fontScale?: number;
};

// Computes initial column widths based on maximum text length in non-colspan cells
const computeInitialWidths = (
    block: TableBlock,
    fontScale: number,
): number[] => {
    const widths: number[] = new Array(block.numCols).fill(60);

    for (const logicalRow of block.blocks) {
        let colIdx = 0;
        for (const col of logicalRow.columns) {
            if (col.colspan === 1) {
                for (const subCell of col.subCells) {
                    const text = subCell.cell.spans
                        .map((s) => s.text)
                        .join("");
                    // Rough estimate of text width based on char count
                    const charCount = text.length;
                    const estimatedWidth = Math.max(
                        60,
                        Math.min(320, Math.ceil(charCount * 8.5 * fontScale + 24)),
                    );
                    if (estimatedWidth > widths[colIdx]) {
                        widths[colIdx] = estimatedWidth;
                    }
                }
            }
            colIdx += col.colspan;
        }
    }

    return widths;
};

const TableView = ({ block, fontScale = 1 }: TableViewProps) => {
    const initialWidths = useMemo(
        () => computeInitialWidths(block, fontScale),
        [block, fontScale],
    );

    const [columnWidths, setColumnWidths] = useState<number[]>(initialWidths);

    const handleCellLayout = useCallback((colIndex: number, measuredWidth: number) => {
        const ceilWidth = Math.ceil(measuredWidth + 24); // add cell padding
        setColumnWidths((prev) => {
            if (ceilWidth > (prev[colIndex] || 0)) {
                const next = [...prev];
                next[colIndex] = ceilWidth;
                return next;
            }
            return prev;
        });
    }, []);

    return (
        <View style={styles.outerContainer}>
            {!!block.caption && (
                <Text style={styles.caption}>{block.caption}</Text>
            )}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.table}>
                    {block.blocks.map((logicalRow, blockIndex) => {
                        let currentColIdx = 0;

                        return (
                            <View
                                key={blockIndex}
                                style={[
                                    styles.logicalRow,
                                    blockIndex > 0 && styles.rowDivider,
                                ]}
                            >
                                {logicalRow.columns.map((col, colIndex) => {
                                    const startCol = currentColIdx;
                                    currentColIdx += col.colspan;

                                    let colWidth = 0;
                                    for (let k = 0; k < col.colspan; k++) {
                                        colWidth += columnWidths[startCol + k] || 60;
                                    }

                                    const isLastColumn =
                                        currentColIdx >= block.numCols;

                                    // Single cell spanning full logical row height
                                    if (
                                        col.subCells.length === 1 &&
                                        col.subCells[0].subRowSpan ===
                                            logicalRow.numSubRows
                                    ) {
                                        const subCell = col.subCells[0];
                                        const cell = subCell.cell;

                                        return (
                                            <View
                                                key={colIndex}
                                                style={[
                                                    styles.cell,
                                                    { width: colWidth },
                                                    cell.isHeader
                                                        ? styles.headerCell
                                                        : styles.dataCell,
                                                    !isLastColumn &&
                                                        styles.columnDivider,
                                                ]}
                                            >
                                                <View
                                                    onLayout={(e) => {
                                                        if (col.colspan === 1) {
                                                            handleCellLayout(
                                                                startCol,
                                                                e.nativeEvent
                                                                    .layout
                                                                    .width,
                                                            );
                                                        }
                                                    }}
                                                    style={styles.cellInner}
                                                >
                                                    <RichText
                                                        spans={cell.spans}
                                                        style={[
                                                            styles.cellText,
                                                            cell.isHeader
                                                                ? styles.headerText
                                                                : styles.dataText,
                                                            {
                                                                fontSize:
                                                                    14 *
                                                                    fontScale,
                                                                textAlign:
                                                                    cell.align ??
                                                                    (cell.isHeader
                                                                        ? "center"
                                                                        : "left"),
                                                            },
                                                        ]}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    }

                                    // Multiple sub-rows in this column
                                    return (
                                        <View
                                            key={colIndex}
                                            style={[
                                                styles.columnStack,
                                                { width: colWidth },
                                                !isLastColumn &&
                                                    styles.columnDivider,
                                            ]}
                                        >
                                            {col.subCells.map(
                                                (subCell, subIndex) => {
                                                    const cell = subCell.cell;

                                                    return (
                                                        <View
                                                            key={subIndex}
                                                            style={[
                                                                styles.cell,
                                                                {
                                                                    flex: subCell.subRowSpan,
                                                                },
                                                                cell.isHeader
                                                                    ? styles.headerCell
                                                                    : styles.dataCell,
                                                                subIndex > 0 &&
                                                                    styles.subRowDivider,
                                                            ]}
                                                        >
                                                            <View
                                                                onLayout={(e) => {
                                                                    if (
                                                                        col.colspan ===
                                                                        1
                                                                    ) {
                                                                        handleCellLayout(
                                                                            startCol,
                                                                            e
                                                                                .nativeEvent
                                                                                .layout
                                                                                .width,
                                                                        );
                                                                    }
                                                                }}
                                                                style={
                                                                    styles.cellInner
                                                                }
                                                            >
                                                                <RichText
                                                                    spans={
                                                                        cell.spans
                                                                    }
                                                                    style={[
                                                                        styles.cellText,
                                                                        cell.isHeader
                                                                            ? styles.headerText
                                                                            : styles.dataText,
                                                                        {
                                                                            fontSize:
                                                                                14 *
                                                                                fontScale,
                                                                            textAlign:
                                                                                cell.align ??
                                                                                (cell.isHeader
                                                                                    ? "center"
                                                                                    : "left"),
                                                                        },
                                                                    ]}
                                                                />
                                                            </View>
                                                        </View>
                                                    );
                                                },
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

export default TableView;

const styles = StyleSheet.create({
    outerContainer: {
        marginVertical: 12,
        paddingHorizontal: 16,
    },
    caption: {
        fontFamily: "DMSans-Medium",
        fontSize: 13,
        color: Colors.textMuted,
        marginBottom: 6,
    },
    scrollContent: {
        paddingRight: 16,
    },
    table: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: Colors.surface,
    },
    logicalRow: {
        flexDirection: "row",
        alignItems: "stretch",
    },
    columnStack: {
        flexDirection: "column",
        alignItems: "stretch",
    },
    cell: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        justifyContent: "center",
    },
    cellInner: {
        alignSelf: "flex-start",
    },
    headerCell: {
        backgroundColor: Colors.surfaceMuted,
    },
    dataCell: {
        backgroundColor: Colors.surface,
    },
    cellText: {
        lineHeight: 20,
    },
    headerText: {
        fontFamily: "DMSans-Bold",
        color: Colors.text,
    },
    dataText: {
        fontFamily: "DMSans-Regular",
        color: Colors.text,
    },
    rowDivider: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    columnDivider: {
        borderRightWidth: 1,
        borderRightColor: Colors.border,
    },
    subRowDivider: {
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },
});
