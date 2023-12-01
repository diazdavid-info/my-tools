import {ColumnStatus} from "./ColumnStatus.tsx";
import {Card} from "./Card.tsx";
import {usePageStore} from "../store"
import type {Steps} from "../pages";
import type {PropsWithChildren} from "react";
import type {Task} from "../task/jira-provider.ts";
import {ColumnStatusList} from "./ColumnStatusList.tsx";

type CardListProps = {
  taskList: Steps[]
}

export const CardList = ({taskList}: PropsWithChildren<CardListProps>) => {
  const page = usePageStore((state) => state.page) || 0
  const data = taskList[page].value

  console.log({data})

  const columnsNameList = Object.keys(data)
  const children = Object.values(data)

  console.log({columnsNameList, children})

  // return Object.entries(data).map(([key, value]) => <ColumnStatusList nameColumnList={key} />)

  return Object.entries(data).map(([key, value]) => {
    return <ColumnStatus name={key} key={key}>
      {value.map((v: Task) => (
        <Card
          key={v.id}
          name={v.name}
          storyId={v.id}
          storyName={v.storyName}
          statusName={v.statusName}
          imageAssign={v.imageAssign}
        />
      ))}
    </ColumnStatus>;
  });
}

