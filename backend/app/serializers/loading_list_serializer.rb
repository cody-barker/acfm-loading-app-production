class LoadingListSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :team_id, :site_name, :date, :return_date, :notes
  belongs_to :user
  belongs_to :team
end