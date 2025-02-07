class LoadingListSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :team_id, :site_name, :date, :return_date, :notes, :loaded, :unloaded
  belongs_to :user
  belongs_to :team
  has_many :loading_list_items
end
