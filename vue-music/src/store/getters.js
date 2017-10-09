// mutation修改完还要去映射state里的数据
// 用getters进行一层包装 从getters里取state中的数据到组件中(而不是state直接映射到组件)
export const singer = state => state.singer
