import RichText from "@/components/RichText";
import Colors from "@/constants/Colors";
import type { TableBlock } from "@/services/articleParser";
import { memo, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type TableViewProps = {
    block: TableBlock;
    fontScale?: number;
};

const MIN_COL_WIDTH = 60;
const MAX_COL_WIDTH = 280;

// Computes initial column widths based on maximum text length in non-colspan cells,
// capping horizontal width at MAX_COL_WIDTH (280px) to prevent excessive width.
const computeInitialWidths = (
    block: TableBlock,
    fontScale: number,
): number[] => {
    const widths: number[] = new Array(block.numCols).fill(MIN_COL_WIDTH);

    for (const logicalRow of block.blocks) {
        let colIdx = 0;
        for (const col of logicalRow.columns) {
            if (col.colspan === 1) {
                for (const subCell of col.subCells) {
                    const text = subCell.cell.spans.map((s) => s.text).join("");
                    // Estimate text width based on char count
                    const charCount = text.length;
                    const estimatedWidth = Math.max(
                        MIN_COL_WIDTH,
                        Math.min(
                            MAX_COL_WIDTH,
                            Math.ceil(charCount * 8 * fontScale + 24),
                        ),
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
    const columnWidths = useMemo(
        () => computeInitialWidths(block, fontScale),
        [block, fontScale],
    );

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
                                        colWidth +=
                                            columnWidths[startCol + k] || MIN_COL_WIDTH;
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
                                                    { width: colWidth, maxWidth: colWidth },
                                                    cell.isHeader
                                                        ? styles.headerCell
                                                        : styles.dataCell,
                                                    !isLastColumn &&
                                                        styles.columnDivider,
                                                ]}
                                            >
                                                <View style={styles.cellInner}>
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
                                                { width: colWidth, maxWidth: colWidth },
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

export default memo(TableView);

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
    scrollContent: {},
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
        width: "100%",
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

