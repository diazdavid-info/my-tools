import type {PropsWithChildren} from "react";
import {ColumnStatus} from "./ColumnStatus.tsx";

type ColumnStatusListProps = {
  nameColumnList: string[]
}

export const ColumnStatusList = ({nameColumnList, children}: PropsWithChildren<ColumnStatusListProps>) => {
  return nameColumnList.map(name => <ColumnStatus key={name} name={name} children={children} />)
}
