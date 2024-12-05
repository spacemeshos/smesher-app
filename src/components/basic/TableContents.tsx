import { TableCellProps, TableRowProps, Td, Tr } from '@chakra-ui/react';

type TdContent = number | string | JSX.Element;
type Tr2 = [TdContent, TdContent];
type Tr3 = [TdContent, TdContent, TdContent];
type Tr4 = [TdContent, TdContent, TdContent, TdContent];
type Tr5 = [TdContent, TdContent, TdContent, TdContent, TdContent];
export type Tr = Tr2[] | Tr3[] | Tr4[] | Tr5[];

export type TableContentsProps = {
  tableKey: string,
  data: Tr;
  trProps?: TableRowProps;
  tdProps?: TableCellProps;
  isLeftHeader?: boolean;
};

export default ({ tableKey, data, trProps, tdProps, isLeftHeader }: TableContentsProps) => {
  return (
    <>
      {data.map((tr, i) => (
        <Tr key={`${tableKey}_tr${i}`} {...trProps}>
          {tr.map((td, j) => (
            <Td
              key={`${tableKey}_tr${i}_td${j}`}
              {...tdProps}
            >
              {td}
            </Td>
          ))}
        </Tr>
      ))}
    </>
  );
}