class LoadingListItemSerializer < ActiveModel::Serializer
  attributes :id, :loading_list_id, :item_id, :quantity
  has_many :loading_lists
end