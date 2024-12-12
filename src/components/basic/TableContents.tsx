import { TableCellProps, TableRowProps, Tbody, Td, Tr } from '@chakra-ui/react';

type TdContent = number | string | JSX.Element;
type Tr2 = [TdContent, TdContent];
type Tr3 = [TdContent, TdContent, TdContent];
type Tr4 = [TdContent, TdContent, TdContent, TdContent];
type Tr5 = [TdContent, TdContent, TdContent, TdContent, TdContent];
export type Tr = Tr2[] | Tr3[] | Tr4[] | Tr5[];

export type TableContentsProps = {
  tableKey: string;
  data: Tr;
  trProps?: TableRowProps;
  tdProps?: TableCellProps;
};

export default function TableContents({
  tableKey,
  data,
  trProps = {},
  tdProps = {},
}: TableContentsProps) {
  return (
    <Tbody>
      {data.map((tr, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Tr key={`${tableKey}_tr${i}`} {...trProps}>
          {tr.map((td, j) => (
            // eslint-disable-next-line react/no-array-index-key
            <Td key={`${tableKey}_tr${i}_td${j}`} {...tdProps}>
              {td}
            </Td>
          ))}
        </Tr>
      ))}
    </Tbody>
  );
}
