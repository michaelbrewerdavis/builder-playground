import _ from "lodash";

import type {
  Activity,
  Section
} from "./types";

interface Generator<T> {
  build: () => T;
}

type X = {  
  activity: Activity;
  section: Section;
};

type F = {
  [k in keyof X as `get${Capitalize<string & k>}`]: () => X[k]
};

const f: F = {
  getActivity: () => ({
    uid: "4",
    isOngoingWeekly: false
  }),
  getSection: () => ({ uid: "3" })
};

console.log(f);

type Builder<T> = (
  params?: any
) => Generator<T>;

interface Registry {
  getBuilder: (t: string) => any;
}

const registryStore: Record<
  string,
  any
> = {};
const registry: Registry = {
  getBuilder: (t: string) =>
    registryStore[t]
};

type Defaults<T> = Partial<
  {
    [key in keyof T]:
      | T[key]
      | (({
          self
        }: {
          self: any;
        }) => Generator<T[key]>);
  }
>;

interface BuilderConfig<T> {
  defaults: () => Defaults<T>;
}
function makeBuilder<T>(
  config: BuilderConfig<T>
): Builder<T> {
  return (params = {}) => ({
    build: () => {
      const generator = {
        ...config.defaults(),
        ...params
      };
      const scalars = _.pickBy(
        generator,
        _.negate(_.isFunction)
      );
      let full = { ...scalars };
      const built = _.mapValues(
        generator,
        (value: any, key: string) => {
          if (
            typeof value === "function"
          ) {
            console.log(
              "building something"
            );
            return value({
              self: full
            }).build();
          }
          return value;
        }
      );
      Object.assign(full, built);
      return full;
    }
  });
}

const ActivityBuilder = makeBuilder<
  Activity
>({
  defaults: () => ({
    uid: "123" + Math.random(),
    section: ({
      self
    }: {
      self: any;
    }) =>
      (registry.getBuilder(
        "section"
      ) as Builder<Section>)({
        activity: self
      })
  })
});

registryStore[
  "activity"
] = ActivityBuilder;

const SectionBuilder = makeBuilder<
  Section
>({
  defaults: () => ({
    uid: "456" + Math.random(),
    activity: ({
      self
    }: {
      self: any;
    }) =>
      (registry.getBuilder(
        "activity"
      ) as Builder<Activity>)({
        section: self
      })
  })
});

registryStore[
  "section"
] = SectionBuilder;

const activity = ActivityBuilder().build();
console.log({ activity });

const section = SectionBuilder().build();
console.log({ section });
